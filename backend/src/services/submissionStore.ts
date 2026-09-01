import { mkdir, readFile, rename, writeFile } from 'fs/promises'
import { randomUUID } from 'crypto'
import path from 'path'

const debugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production'

export type SubmissionKind = 'join' | 'collaborate'

const storeFileNames: Record<SubmissionKind, string> = {
  join: 'join.json',
  collaborate: 'collaborate.json',
}

/** How the notification email for a submission ended up. */
export type SubmissionEmailStatus = 'sent' | 'failed' | 'not_configured' | 'authorization_required'

export type StoredSubmission = {
  id: string
  submittedAt: string
  emailStatus: SubmissionEmailStatus
} & Record<string, string>

function debugLog(message: string, metadata?: Record<string, unknown>) {
  if (!debugEnabled) {
    return
  }

  if (metadata) {
    console.debug(`[DEBUG][submissionStore] ${message}`, metadata)
    return
  }

  console.debug(`[DEBUG][submissionStore] ${message}`)
}

/**
 * Resolved lazily so `dotenv.config()` (run when graphAuthService loads) has
 * already populated the environment by the time the first submission arrives.
 */
function storePath(kind: SubmissionKind): string {
  const directory = process.env.SUBMISSION_STORE_DIR?.trim() || path.resolve(process.cwd(), 'data')
  return path.join(directory, storeFileNames[kind])
}

/**
 * Writes are queued per file so two submissions arriving together cannot both
 * read the same array and then overwrite each other's append.
 */
const writeQueues = new Map<string, Promise<unknown>>()

function enqueue<T>(filePath: string, task: () => Promise<T>): Promise<T> {
  const previous = writeQueues.get(filePath) ?? Promise.resolve()
  const next = previous.then(task, task)
  writeQueues.set(
    filePath,
    next.catch(() => undefined),
  )
  return next
}

async function readSubmissions(filePath: string): Promise<StoredSubmission[]> {
  let raw: string

  try {
    raw = await readFile(filePath, 'utf8')
  } catch {
    // No file yet: the first submission creates it.
    return []
  }

  try {
    const parsed = JSON.parse(raw)

    if (Array.isArray(parsed)) {
      return parsed as StoredSubmission[]
    }
  } catch {
    // Fall through to the salvage path below.
  }

  // Never overwrite something we could not parse: move it aside so past
  // submissions stay recoverable while new ones keep being recorded.
  const salvagePath = `${filePath}.corrupt-${Date.now()}`
  await rename(filePath, salvagePath)
  console.error(
    `Submission store at ${filePath} was not a JSON array. Moved it to ${salvagePath} and started a new file.`,
  )

  return []
}

async function writeSubmissions(filePath: string, submissions: StoredSubmission[]): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })

  // Write-then-rename so a crash mid-write cannot truncate the existing file.
  const temporaryPath = `${filePath}.tmp`
  await writeFile(temporaryPath, `${JSON.stringify(submissions, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, filePath)
}

/**
 * Appends one submission to its store file. Persistence must never fail a form
 * response, so problems are logged instead of thrown.
 */
export async function recordSubmission(
  kind: SubmissionKind,
  fields: Record<string, string>,
  emailStatus: SubmissionEmailStatus,
): Promise<StoredSubmission | null> {
  const filePath = storePath(kind)

  const submission: StoredSubmission = {
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
    emailStatus,
    ...fields,
  }

  try {
    return await enqueue(filePath, async () => {
      const submissions = await readSubmissions(filePath)
      submissions.push(submission)
      await writeSubmissions(filePath, submissions)

      debugLog(`Recorded ${kind} submission`, {
        id: submission.id,
        emailStatus,
        total: submissions.length,
        filePath,
      })

      return submission
    })
  } catch (error) {
    console.error(`Failed to record ${kind} submission in ${filePath}:`, error)
    return null
  }
}

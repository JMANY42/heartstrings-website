import dotenv from 'dotenv'
import { randomBytes } from 'crypto'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

dotenv.config()

const debugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production'
const authAuthority = process.env.GRAPH_AUTHORITY?.trim() || 'common'
const redirectUri =
  process.env.GRAPH_REDIRECT_URI?.trim() || 'http://localhost:3001/api/auth/microsoft/callback'
const scope = 'offline_access openid profile email Mail.Send'
const tokenStorePath =
  process.env.GRAPH_TOKEN_STORE_PATH?.trim() || path.resolve(process.cwd(), 'data/graph-tokens.json')
const stateTtlMs = 10 * 60 * 1000

let pendingStates = new Map<string, { returnTo: string; createdAt: number }>()

export class GraphAuthRequiredError extends Error {
  constructor(message = 'Microsoft account authentication is required.') {
    super(message)
    this.name = 'GraphAuthRequiredError'
  }
}

export type GraphTokenRecord = {
  accessToken: string
  accessTokenExpiresAt: number
  refreshToken: string
  accountEmail?: string
  accountName?: string
  scope?: string
  tokenType?: string
  updatedAt: string
}

type TokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  scope?: string
  token_type?: string
  id_token?: string
  error?: string
  error_description?: string
}

function debugLog(message: string, metadata?: Record<string, unknown>) {
  if (!debugEnabled) {
    return
  }

  if (metadata) {
    console.debug(`[DEBUG][graphAuthService] ${message}`, metadata)
    return
  }

  console.debug(`[DEBUG][graphAuthService] ${message}`)
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function cleanupExpiredStates() {
  const now = Date.now()

  for (const [state, details] of pendingStates.entries()) {
    if (now - details.createdAt > stateTtlMs) {
      pendingStates.delete(state)
    }
  }
}

export function createMicrosoftAuthUrl(returnTo = '/') {
  const clientId = getRequiredEnv('GRAPH_CLIENT_ID')
  const state = randomBytes(24).toString('hex')

  cleanupExpiredStates()
  pendingStates.set(state, { returnTo, createdAt: Date.now() })

  const url = new URL(`https://login.microsoftonline.com/${authAuthority}/oauth2/v2.0/authorize`)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_mode', 'query')
  url.searchParams.set('scope', scope)
  url.searchParams.set('state', state)
  url.searchParams.set('prompt', 'consent')

  return url.toString()
}

export function consumeAuthState(state: string) {
  cleanupExpiredStates()
  const details = pendingStates.get(state)

  if (!details) {
    throw new Error('Invalid or expired authentication state.')
  }

  pendingStates.delete(state)
  return details
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')

  if (parts.length < 2) {
    return null
  }

  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    const parsed = Buffer.from(padded, 'base64').toString('utf8')
    return JSON.parse(parsed) as Record<string, unknown>
  } catch {
    return null
  }
}

function normalizeAccountEmail(response: TokenResponse): string | undefined {
  if (!response.id_token) {
    return undefined
  }

  const payload = decodeJwtPayload(response.id_token)

  if (!payload) {
    return undefined
  }

  const email = payload.preferred_username || payload.email || payload.upn
  return typeof email === 'string' ? email : undefined
}

async function readTokenRecord(): Promise<GraphTokenRecord | null> {
  try {
    const raw = await readFile(tokenStorePath, 'utf8')
    return JSON.parse(raw) as GraphTokenRecord
  } catch {
    return null
  }
}

async function saveTokenRecord(record: GraphTokenRecord): Promise<void> {
  await mkdir(path.dirname(tokenStorePath), { recursive: true })
  await writeFile(tokenStorePath, JSON.stringify(record, null, 2), 'utf8')
}

async function exchangeToken(params: URLSearchParams): Promise<GraphTokenRecord> {
  const clientId = getRequiredEnv('GRAPH_CLIENT_ID')
  const clientSecret = getRequiredEnv('GRAPH_CLIENT_SECRET')

  params.set('client_id', clientId)
  params.set('client_secret', clientSecret)

  const response = await fetch(`https://login.microsoftonline.com/${authAuthority}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  const data = (await response.json()) as TokenResponse

  if (!response.ok || !data.access_token || !data.expires_in) {
    debugLog('Graph token exchange failed', {
      status: response.status,
      error: data.error ?? 'unknown_error',
    })
    throw new Error(data.error_description ?? 'Failed to acquire Microsoft Graph access token')
  }

  const refreshToken = data.refresh_token
  if (!refreshToken) {
    throw new Error('Microsoft Graph did not return a refresh token. Ensure offline_access is granted.')
  }

  const record: GraphTokenRecord = {
    accessToken: data.access_token,
    accessTokenExpiresAt: Date.now() + Math.max(data.expires_in - 120, 60) * 1000,
    refreshToken,
    accountEmail: normalizeAccountEmail(data),
    scope: data.scope,
    tokenType: data.token_type,
    updatedAt: new Date().toISOString(),
  }

  await saveTokenRecord(record)
  debugLog('Graph tokens saved', {
    accountEmail: record.accountEmail,
    expiresInSeconds: data.expires_in,
  })

  return record
}

export async function exchangeAuthorizationCode(code: string): Promise<GraphTokenRecord> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    scope,
  })

  return exchangeToken(params)
}

async function refreshAccessToken(record: GraphTokenRecord): Promise<GraphTokenRecord> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: record.refreshToken,
    redirect_uri: redirectUri,
    scope,
  })

  return exchangeToken(params)
}

export async function getAuthenticatedAccount(): Promise<Pick<GraphTokenRecord, 'accountEmail' | 'updatedAt'> | null> {
  const record = await readTokenRecord()

  if (!record) {
    return null
  }

  return {
    accountEmail: record.accountEmail,
    updatedAt: record.updatedAt,
  }
}

export async function getValidAccessToken(): Promise<string> {
  const record = await readTokenRecord()

  if (!record) {
    throw new GraphAuthRequiredError()
  }

  const timeLeftMs = record.accessTokenExpiresAt - Date.now()
  if (timeLeftMs > 60 * 1000) {
    return record.accessToken
  }

  debugLog('Refreshing Graph access token', {
    accountEmail: record.accountEmail,
  })

  const refreshed = await refreshAccessToken(record)
  return refreshed.accessToken
}

export async function getAuthStatus() {
  const record = await readTokenRecord()

  if (!record) {
    return {
      authenticated: false,
      accountEmail: null,
      expiresAt: null,
    }
  }

  return {
    authenticated: true,
    accountEmail: record.accountEmail ?? null,
    expiresAt: new Date(record.accessTokenExpiresAt).toISOString(),
  }
}

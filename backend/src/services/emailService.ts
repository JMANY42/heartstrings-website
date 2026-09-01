import { sendMailWithGraph } from './graphMailClient.js'
import type { GraphMailRequest } from './graphMailClient.js'
import { GraphAuthRequiredError } from './graphAuthService.js'
import { recordSubmission } from './submissionStore.js'
import type { SubmissionEmailStatus, SubmissionKind } from './submissionStore.js'

const environment = process.env.NODE_ENV || 'testing'
const debugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production'

const ORGANIZATION_NAME = 'Heartstrings'
const ORGANIZATION_DESCRIPTION =
  'a student organization at the University of Texas at Dallas, Richardson, TX'
const INSTAGRAM_URL = 'https://www.instagram.com/heartstringsatutd/'

function debugLog(message: string, metadata?: Record<string, unknown>) {
  if (!debugEnabled) {
    return
  }

  if (metadata) {
    console.debug(`[DEBUG][emailService] ${message}`, metadata)
    return
  }

  console.debug(`[DEBUG][emailService] ${message}`)
}

export type ServiceResult = {
  status: number
  body: {
    message: string
    success?: boolean
  }
}

export type JoinPayload = {
  name?: unknown
  email?: unknown
  instrument?: unknown
  experienceLevel?: unknown
}

export type ContactPayload = {
  name?: unknown
  email?: unknown
  organization?: unknown
  message?: unknown
}

type ConfigurationError = {
  configurationError: string
}

type ComposedEmail = Omit<GraphMailRequest, 'html'> & {
  heading: string
  content: string
  footer: string
}

type EmailTemplate<TField extends string> = {
  kind: string
  /** File under the data directory that every accepted submission is appended to. */
  store: SubmissionKind
  requiredFields: readonly TField[]
  successMessage: string
  compose(fields: Record<TField, string>): ComposedEmail | ConfigurationError
  logMetadata?(fields: Record<TField, string>): Record<string, unknown>
}

function toTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Submitted values are attacker-controlled and end up inside an email sent from
 * the club mailbox, so they are escaped before they reach the HTML body.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeHtmlWithBreaks(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, '<br>')
}

/** Keeps submitted text out of the mail headers: no newlines, no unbounded length. */
function toSubjectFragment(value: string, maxLength = 78): string {
  const collapsed = value.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
  return collapsed.length > maxLength ? `${collapsed.slice(0, maxLength - 1)}…` : collapsed
}

function siteUrl(): string | undefined {
  return process.env.PUBLIC_SITE_URL?.trim() || undefined
}

function formatSubmittedAt(): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Chicago',
  }).format(new Date())
}

function isConfigurationError(
  composed: ComposedEmail | ConfigurationError,
): composed is ConfigurationError {
  return 'configurationError' in composed
}

function renderEmailHtml(heading: string, content: string, footer: string): string {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #444; max-width: 600px; margin: 0 auto; padding: 8px;">
      <h1 style="font-size: 22px; color: #333; border-bottom: 2px solid #c9748f; padding-bottom: 10px; margin: 0 0 24px 0;">
        ${heading}
      </h1>

      ${content}

      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #ddd; color: #767676; font-size: 12px; line-height: 1.6;">
        ${footer}
      </div>
    </div>
  `
}

function sectionHeading(text: string): string {
  return `<h2 style="font-size: 16px; color: #c9748f; margin: 28px 0 8px 0;">${text}</h2>`
}

function paragraph(html: string): string {
  return `<p style="margin: 0 0 16px 0;">${html}</p>`
}

function detailCard(rows: string[]): string {
  return `
      <div style="margin: 16px 0; padding: 16px; border-radius: 12px; background: #fff8f4; border: 1px solid #f9c6d7;">
        ${rows.map((row) => `<p style="margin: 0 0 8px 0;">${row}</p>`).join('\n        ')}
      </div>`
}

/**
 * Builds a mailto: URL that opens a brand-new message, so answering a submitter
 * never carries the notification thread along with it.
 */
function mailtoLink(address: string, subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body })
  // URLSearchParams encodes spaces as "+", which mail clients show literally.
  return `mailto:${encodeURIComponent(address)}?${params.toString().replace(/\+/g, '%20')}`
}

function buttonLink(href: string, label: string): string {
  return `
      <p style="margin: 0 0 16px 0;">
        <a href="${escapeHtml(href)}" style="display: inline-block; padding: 12px 22px; border-radius: 999px; background: #c9748f; color: #ffffff; font-weight: bold; text-decoration: none;">${escapeHtml(label)}</a>
      </p>`
}

async function sendTemplatedEmail<TField extends string>(
  template: EmailTemplate<TField>,
  payload: Partial<Record<TField, unknown>>,
): Promise<ServiceResult> {
  const fields = {} as Record<TField, string>
  const presence: Record<string, boolean> = {}

  for (const field of template.requiredFields) {
    fields[field] = toTrimmedString(payload[field])
    presence[`has${field.charAt(0).toUpperCase()}${field.slice(1)}`] = Boolean(fields[field])
  }

  debugLog(`Handling ${template.kind} request payload`, presence)

  if (template.requiredFields.some((field) => !fields[field])) {
    debugLog(`Validation failed: missing required ${template.kind} fields`)
    return {
      status: 400,
      body: {
        message: 'All fields are required.',
      },
    }
  }

  // Anything past this point is a real submission, so it is saved to disk no
  // matter how the email itself turns out.
  let emailStatus: SubmissionEmailStatus = 'failed'

  try {
    const composed = template.compose(fields)

    if (isConfigurationError(composed)) {
      emailStatus = 'not_configured'
      debugLog(`Configuration missing for ${template.kind} email`, {
        reason: composed.configurationError,
      })
      return {
        status: 500,
        body: {
          message: composed.configurationError,
        },
      }
    }

    const { heading, content, footer, ...mailOptions } = composed

    debugLog(`Sending ${template.kind} email via Microsoft Graph`)
    try {
      await sendMailWithGraph({
        ...mailOptions,
        html: renderEmailHtml(heading, content, footer),
      })
      emailStatus = 'sent'
      debugLog(`${template.kind} email sent successfully`, {
        ...template.logMetadata?.(fields),
        environment,
      })
    } catch (error) {
      if (error instanceof GraphAuthRequiredError) {
        emailStatus = 'authorization_required'
        debugLog(
          `Microsoft account authorization is required before sending ${template.kind} email`,
        )
        return {
          status: 503,
          body: {
            message:
              'Microsoft account authorization is required. Visit /api/auth/microsoft/start to connect the mailbox.',
          },
        }
      }

      throw error
    }

    return {
      status: 200,
      body: {
        message: template.successMessage,
        success: true,
      },
    }
  } finally {
    await recordSubmission(template.store, fields, emailStatus)
  }
}

const joinTemplate: EmailTemplate<'name' | 'email' | 'instrument' | 'experienceLevel'> = {
  kind: 'join',
  store: 'join',
  requiredFields: ['name', 'email', 'instrument', 'experienceLevel'],
  successMessage: 'GroupMe link sent successfully.',
  logMetadata: ({ instrument, experienceLevel }) => ({ instrument, experienceLevel }),
  compose({ name, email, instrument, experienceLevel }) {
    const groupMeLink = process.env.GROUPME_LINK?.trim()

    if (!groupMeLink) {
      return { configurationError: 'GroupMe link is not configured.' }
    }

    const contactAddress = process.env.GRAPH_CONTACT_RECIPIENT?.trim() || undefined
    const website = siteUrl()
    const safeLink = escapeHtml(groupMeLink)

    const content = `
      ${paragraph(`Hi ${escapeHtml(name)},`)}
      ${paragraph(
        `Thanks for asking to join <strong>Heartstrings</strong>, a student-run chamber ensemble at the University of Texas at Dallas. We are glad you want to play with us, and everything you need to get started is below.`,
      )}

      ${sectionHeading('What Heartstrings does')}
      ${paragraph(
        `We bring live chamber music to places where people rarely get to hear it: hospitals, clinics, and care facilities around the Dallas area. We play in small groups of four to six musicians, our repertoire runs from Baroque to contemporary, and every performance is free and volunteer-driven. We look for care, consistency, and musical sensitivity above all else.`,
      )}

      ${sectionHeading('Your next step: join the GroupMe')}
      ${paragraph(
        `Rehearsal times, performance sign-ups, and day-to-day questions all happen in our GroupMe chat. You can join it here:`,
      )}
      ${paragraph(
        `<a href="${safeLink}" style="color: #c9748f; font-weight: bold;">${safeLink}</a>`,
      )}
      ${paragraph(
        `If that link does not open, copy the address above into your browser. Once you are in, introduce yourself with your name and instrument so we know who to look for.`,
      )}

      ${sectionHeading('What happens next')}
      <ul style="margin: 0 0 16px 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">An officer will post the current rehearsal schedule in the GroupMe and follow up with you there.</li>
        <li style="margin-bottom: 8px;">We match you into an ensemble that fits your instrument and availability. There is no audition.</li>
        <li style="margin-bottom: 8px;">Bring your own instrument; we handle sheet music, scheduling, and venue coordination.</li>
      </ul>

      ${sectionHeading('What you sent us')}
      ${detailCard([
        `<strong>Name:</strong> ${escapeHtml(name)}`,
        `<strong>Instrument:</strong> ${escapeHtml(instrument)}`,
        `<strong>Experience level:</strong> ${escapeHtml(experienceLevel)}`,
        `<strong>Email:</strong> ${escapeHtml(email)}`,
      ])}

      ${paragraph(
        `If anything above looks wrong, or you have a question before joining, just reply to this email and one of our officers will answer.`,
      )}
    `

    const footer = `
        <p style="margin: 0 0 12px 0;">
          <strong>${ORGANIZATION_NAME}</strong> &mdash; ${ORGANIZATION_DESCRIPTION}.<br>
          ${website ? `Website: <a href="${escapeHtml(website)}" style="color: #767676;">${escapeHtml(website)}</a><br>` : ''}
          Instagram: <a href="${INSTAGRAM_URL}" style="color: #767676;">${INSTAGRAM_URL}</a>${
            contactAddress
              ? `<br>Email: <a href="mailto:${escapeHtml(contactAddress)}" style="color: #767676;">${escapeHtml(contactAddress)}</a>`
              : ''
          }
        </p>
        <p style="margin: 0;">
          You are receiving this one-time message because this address was entered on the
          ${ORGANIZATION_NAME} membership form${website ? ` at ${escapeHtml(website)}` : ''}.
          We do not add you to any mailing list. If this was not you, no action is needed &mdash;
          reply to let us know and we will make sure the address is not used again.
        </p>`

    return {
      to: email,
      subject: 'Heartstrings at UT Dallas: your GroupMe link and next steps',
      replyTo: contactAddress,
      heading: `Welcome to ${ORGANIZATION_NAME}`,
      content,
      footer,
    }
  },
}

const contactTemplate: EmailTemplate<'name' | 'email' | 'organization' | 'message'> = {
  kind: 'contact',
  store: 'collaborate',
  requiredFields: ['name', 'email', 'organization', 'message'],
  successMessage: 'Email sent successfully.',
  logMetadata: ({ organization }) => ({ organization }),
  compose({ name, email, organization, message }) {
    const contactRecipient = process.env.GRAPH_CONTACT_RECIPIENT?.trim()

    if (!contactRecipient) {
      return { configurationError: 'Email service is not configured.' }
    }

    const content = `
      ${paragraph(
        `${escapeHtml(name)} from <strong>${escapeHtml(organization)}</strong> submitted the collaboration form on ${formatSubmittedAt()} (Central Time).`,
      )}

      ${sectionHeading('Who got in touch')}
      ${detailCard([
        `<strong>Name:</strong> ${escapeHtml(name)}`,
        `<strong>Organization:</strong> ${escapeHtml(organization)}`,
        `<strong>Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color: #c9748f;">${escapeHtml(email)}</a>`,
      ])}

      ${sectionHeading('Their message')}
      <div style="margin: 16px 0; padding: 16px; border-left: 3px solid #c9748f; background: #fafafa;">
        ${escapeHtmlWithBreaks(message)}
      </div>

      ${sectionHeading('Answer them')}
      ${buttonLink(
        mailtoLink(
          email,
          `${ORGANIZATION_NAME} at UT Dallas`,
          `Hi ${name},\n\nThank you for reaching out to ${ORGANIZATION_NAME} about working together with ${organization}.\n\n`,
        ),
        `Email ${name}`,
      )}
      ${paragraph(
        `If the button does not open your mail app, start a new message to <a href="mailto:${escapeHtml(email)}" style="color: #c9748f;">${escapeHtml(email)}</a>.`,
      )}
    `

    const footer = `
        <p style="margin: 0;">
          Sent automatically by the ${ORGANIZATION_NAME} website collaboration form.
          The contents above were written by the submitter and have not been verified.
          Replies to this notification stay in the ${ORGANIZATION_NAME} mailbox and are not
          delivered to the submitter.
        </p>`

    return {
      to: contactRecipient,
      subject: `Collaboration request from ${toSubjectFragment(organization)}`,
      // No replyTo: an accidental reply must not reach the submitter with this
      // notification quoted underneath it.
      heading: 'New collaboration request',
      content,
      footer,
    }
  },
}

export const emailService = {
  async sendJoinEmail(payload: JoinPayload): Promise<ServiceResult> {
    return sendTemplatedEmail(joinTemplate, payload)
  },

  async sendContactEmail(payload: ContactPayload): Promise<ServiceResult> {
    return sendTemplatedEmail(contactTemplate, payload)
  },
}

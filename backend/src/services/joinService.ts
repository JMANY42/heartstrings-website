import { sendMailWithGraph } from './graphMailClient.js'
import { GraphAuthRequiredError } from './graphAuthService.js'

const environment = process.env.NODE_ENV || 'testing'
const debugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production'

function debugLog(message: string, metadata?: Record<string, unknown>) {
  if (!debugEnabled) {
    return
  }

  if (metadata) {
    console.debug(`[DEBUG][joinService] ${message}`, metadata)
    return
  }

  console.debug(`[DEBUG][joinService] ${message}`)
}

export type JoinPayload = {
  name?: unknown
  email?: unknown
  instrument?: unknown
  experienceLevel?: unknown
}

export type ServiceResult = {
  status: number
  body: {
    message: string
    success?: boolean
  }
}

function toTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export const joinService = {
  async handleRequest(payload: JoinPayload): Promise<ServiceResult> {
    const name = toTrimmedString(payload.name)
    const email = toTrimmedString(payload.email)
    const instrument = toTrimmedString(payload.instrument)
    const experienceLevel = toTrimmedString(payload.experienceLevel)
    const groupMeLink = process.env.GROUPME_LINK

    debugLog('Handling join request payload', {
      hasName: Boolean(name),
      hasEmail: Boolean(email),
      hasInstrument: Boolean(instrument),
      hasExperienceLevel: Boolean(experienceLevel),
    })

    if (!name || !email || !instrument || !experienceLevel) {
      debugLog('Validation failed: missing required join fields')
      return {
        status: 400,
        body: {
          message: 'All fields are required.',
        },
      }
    }

    if (!groupMeLink) {
      debugLog('Configuration missing: GroupMe link is not set')
      return {
        status: 500,
        body: {
          message: 'GroupMe link is not configured.',
        },
      }
    }

    const mailOptions = {
      to: email,
      subject: 'Heartstrings GroupMe Invite',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #c9748f; padding-bottom: 10px;">
            Welcome to Heartstrings
          </h2>

          <p style="margin: 20px 0; color: #666; line-height: 1.6;">
            Hi ${name},
          </p>

          <p style="margin: 20px 0; color: #666; line-height: 1.6;">
            Thanks for requesting to join Heartstrings. Here is the GroupMe link for the ensemble:
          </p>

          <p style="margin: 20px 0;">
            <a href="${groupMeLink}" style="color: #c9748f; font-weight: bold; text-decoration: none;">
              Join the Heartstrings GroupMe
            </a>
          </p>

          <div style="margin: 20px 0; padding: 16px; border-radius: 12px; background: #fff8f4; border: 1px solid #f9c6d7; color: #666;">
            <p style="margin: 0 0 8px 0;"><strong>Instrument:</strong> ${instrument}</p>
            <p style="margin: 0 0 8px 0;"><strong>Experience level:</strong> ${experienceLevel}</p>
            <p style="margin: 0;"><strong>Sent to:</strong> <a href="mailto:${email}">${email}</a></p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
            <p>This email was sent from the ${environment} server.</p>
          </div>
        </div>
      `,
      replyTo: process.env.GRAPH_CONTACT_RECIPIENT ?? undefined,
    }

    debugLog('Sending join email via Microsoft Graph')
    try {
      await sendMailWithGraph(mailOptions)
      debugLog('Join email sent successfully', {
        instrument,
        experienceLevel,
        environment,
      })
    } catch (error) {
      if (error instanceof GraphAuthRequiredError) {
        debugLog('Microsoft account authorization is required before sending join email')
        return {
          status: 503,
          body: {
            message: 'Microsoft account authorization is required. Visit /api/auth/microsoft/start to connect the mailbox.',
          },
        }
      }

      throw error
    }

    return {
      status: 200,
      body: {
        message: 'GroupMe link sent successfully.',
        success: true,
      },
    }
  },
}

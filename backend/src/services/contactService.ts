import { sendMailWithGraph } from './graphMailClient.js'
import { GraphAuthRequiredError } from './graphAuthService.js'

const environment = process.env.NODE_ENV || 'testing'
const debugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production'

function debugLog(message: string, metadata?: Record<string, unknown>) {
  if (!debugEnabled) {
    return
  }

  if (metadata) {
    console.debug(`[DEBUG][contactService] ${message}`, metadata)
    return
  }

  console.debug(`[DEBUG][contactService] ${message}`)
}

export type ContactPayload = {
  name?: unknown
  email?: unknown
  organization?: unknown
  message?: unknown
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

export const contactService = {
  async handleRequest(payload: ContactPayload): Promise<ServiceResult> {
    const name = toTrimmedString(payload.name)
    const email = toTrimmedString(payload.email)
    const organization = toTrimmedString(payload.organization)
    const message = toTrimmedString(payload.message)

    debugLog('Handling contact request payload', {
      hasName: Boolean(name),
      hasEmail: Boolean(email),
      hasOrganization: Boolean(organization),
      messageLength: message.length,
    })

    if (!name || !email || !organization || !message) {
      debugLog('Validation failed: missing required contact fields')
      return {
        status: 400,
        body: {
          message: 'All fields are required.',
        },
      }
    }

    const contactRecipient = process.env.GRAPH_CONTACT_RECIPIENT?.trim()

    if (!contactRecipient) {
      debugLog('Configuration missing: contact recipient is not set')
      return {
        status: 500,
        body: {
          message: 'Email service is not configured.',
        },
      }
    }

    const mailOptions = {
      to: contactRecipient,
      subject: `Heartstrings Collaboration Request: ${organization}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #c9748f; padding-bottom: 10px;">
            New Collaboration Request
          </h2>

          <div style="margin: 20px 0;">
            <h3 style="color: #c9748f; margin-bottom: 5px;">From:</h3>
            <p style="margin: 5px 0; color: #666;">
              <strong>Name:</strong> ${name}<br>
              <strong>Email:</strong> <a href="mailto:${email}">${email}</a><br>
              <strong>Organization:</strong> ${organization}
            </p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #c9748f; margin-bottom: 5px;">Message:</h3>
            <p style="margin: 5px 0; color: #666; white-space: pre-wrap;">${message}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
            <p>This email was sent from the ${environment} server.</p>
          </div>
        </div>
      `,
      replyTo: email,
    }

    debugLog('Sending contact email via Microsoft Graph')
    try {
      await sendMailWithGraph(mailOptions)
      debugLog('Contact email sent successfully', {
        organization,
        environment,
      })
    } catch (error) {
      if (error instanceof GraphAuthRequiredError) {
        debugLog('Microsoft account authorization is required before sending contact email')
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
        message: 'Email sent successfully.',
        success: true,
      },
    }
  },
}

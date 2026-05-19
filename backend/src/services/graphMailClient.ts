import dotenv from 'dotenv'

import { GraphAuthRequiredError, getValidAccessToken } from './graphAuthService.js'

dotenv.config()

const debugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production'

function debugLog(message: string, metadata?: Record<string, unknown>) {
  if (!debugEnabled) {
    return
  }

  if (metadata) {
    console.debug(`[DEBUG][graphMailClient] ${message}`, metadata)
    return
  }

  console.debug(`[DEBUG][graphMailClient] ${message}`)
}

async function getAccessToken(): Promise<string> {
  const token = await getValidAccessToken()
  return token
}

export type GraphMailRequest = {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export async function sendMailWithGraph(request: GraphMailRequest): Promise<void> {
  const accessToken = await getAccessToken()

  const payload = {
    message: {
      subject: request.subject,
      body: {
        contentType: 'HTML',
        content: request.html,
      },
      toRecipients: [
        {
          emailAddress: {
            address: request.to,
          },
        },
      ],
      ...(request.replyTo
        ? {
            replyTo: [
              {
                emailAddress: {
                  address: request.replyTo,
                },
              },
            ],
          }
        : {}),
    },
    saveToSentItems: true,
  }

  debugLog('Sending Graph mail', {
    toDomain: request.to.includes('@') ? request.to.split('@')[1] : 'invalid',
  })

  const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    debugLog('Graph sendMail failed', {
      status: response.status,
      body: errorBody.slice(0, 400),
    })
    if (response.status === 401) {
      debugLog('Graph sendMail returned 401; Microsoft account sign-in is required')
      throw new GraphAuthRequiredError('Microsoft account authorization is required.')
    }
    throw new Error('Microsoft Graph sendMail request failed')
  }

  debugLog('Graph mail sent successfully')
}

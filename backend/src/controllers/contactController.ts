import type { Request, Response } from 'express'
import { contactService } from '../services/contactService.js'

const debugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production'

export async function handleContactRequest(request: Request, response: Response) {
  if (debugEnabled) {
    console.debug('[DEBUG][contactController] Request received', {
      hasName: typeof request.body?.name === 'string',
      hasEmail: typeof request.body?.email === 'string',
      hasOrganization: typeof request.body?.organization === 'string',
      messageLength:
        typeof request.body?.message === 'string' ? request.body.message.trim().length : 0,
    })
  }

  try {
    const result = await contactService.handleRequest(request.body)
    if (debugEnabled) {
      console.debug('[DEBUG][contactController] Request handled', {
        status: result.status,
        success: result.body.success ?? false,
      })
    }
    response.status(result.status).json(result.body)
  } catch (error) {
    console.error('Error sending collaboration email:', error)
    response.status(500).json({
      message: 'Failed to send collaboration email. Please try again later.',
    })
  }
}

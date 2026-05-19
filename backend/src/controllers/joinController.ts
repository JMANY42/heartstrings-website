import type { Request, Response } from 'express'
import { joinService } from '../services/joinService.js'

const debugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production'

export async function handleJoinRequest(request: Request, response: Response) {
  if (debugEnabled) {
    console.debug('[DEBUG][joinController] Request received', {
      hasName: typeof request.body?.name === 'string',
      hasEmail: typeof request.body?.email === 'string',
      hasInstrument: typeof request.body?.instrument === 'string',
      hasExperienceLevel: typeof request.body?.experienceLevel === 'string',
    })
  }

  try {
    const result = await joinService.handleRequest(request.body)
    if (debugEnabled) {
      console.debug('[DEBUG][joinController] Request handled', {
        status: result.status,
        success: result.body.success ?? false,
      })
    }
    response.status(result.status).json(result.body)
  } catch (error) {
    console.error('Error sending GroupMe invite email:', error)
    response.status(500).json({
      message: 'Failed to send GroupMe invite email. Please try again later.',
    })
  }
}

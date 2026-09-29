import type { Request, Response } from 'express'
import { emailService } from '../services/emailService.js'

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
    const result = await emailService.sendJoinEmail(request.body)
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

/* The GroupMe invite link is kept out of the frontend bundle so it can't be
   scraped from the page source; the Join section fetches it from here only
   when someone clicks the button. */
export function handleGroupMeLinkRequest(_request: Request, response: Response) {
  const groupMeLink = process.env.GROUPME_LINK?.trim()

  response.set('Cache-Control', 'no-store')
  response.set('X-Robots-Tag', 'noindex, nofollow')

  if (!groupMeLink) {
    response.status(503).json({ message: 'GroupMe link is not configured.' })
    return
  }

  response.json({ url: groupMeLink })
}

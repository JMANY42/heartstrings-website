import type { Request, Response } from 'express'
import {
  consumeAuthState,
  createMicrosoftAuthUrl,
  exchangeAuthorizationCode,
  getAuthStatus,
} from '../services/graphAuthService.js'

const debugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production'

function debugLog(message: string, metadata?: Record<string, unknown>) {
  if (!debugEnabled) {
    return
  }

  if (metadata) {
    console.debug(`[DEBUG][authController] ${message}`, metadata)
    return
  }

  console.debug(`[DEBUG][authController] ${message}`)
}

export function handleMicrosoftAuthStart(request: Request, response: Response) {
  const returnTo = typeof request.query.returnTo === 'string' ? request.query.returnTo : '/'
  const authUrl = createMicrosoftAuthUrl(returnTo)

  debugLog('Redirecting to Microsoft auth URL', { returnTo })
  response.redirect(authUrl)
}

export async function handleMicrosoftAuthCallback(request: Request, response: Response) {
  const code = typeof request.query.code === 'string' ? request.query.code : ''
  const state = typeof request.query.state === 'string' ? request.query.state : ''

  if (!code || !state) {
    return response.status(400).json({ message: 'Missing authorization code or state.' })
  }

  try {
    const stateDetails = consumeAuthState(state)
    const tokenRecord = await exchangeAuthorizationCode(code)

    debugLog('Microsoft account connected', {
      returnTo: stateDetails.returnTo,
      accountEmail: tokenRecord.accountEmail ?? 'unknown',
    })

    response.status(200).json({
      message: 'Microsoft account connected successfully.',
      accountEmail: tokenRecord.accountEmail ?? null,
      returnTo: stateDetails.returnTo,
    })
  } catch (error) {
    console.error('Microsoft auth callback failed:', error)
    response.status(500).json({
      message: 'Failed to complete Microsoft sign-in.',
    })
  }
}

export async function handleMicrosoftAuthStatus(_request: Request, response: Response) {
  const status = await getAuthStatus()
  response.json(status)
}

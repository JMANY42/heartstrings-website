import { Router } from 'express'
import {
  handleMicrosoftAuthCallback,
  handleMicrosoftAuthStart,
  handleMicrosoftAuthStatus,
} from '../controllers/authController.js'

export const authRouter = Router()

authRouter.get('/microsoft/start', handleMicrosoftAuthStart)
authRouter.get('/microsoft/callback', handleMicrosoftAuthCallback)
authRouter.get('/microsoft/status', handleMicrosoftAuthStatus)

import { Router } from 'express'
import { handleContactRequest } from '../controllers/contactController.js'

export const contactRouter = Router()

contactRouter.post('/', handleContactRequest)

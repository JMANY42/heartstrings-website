import { Router } from 'express'
import { handleJoinRequest } from '../controllers/joinController.js'

export const joinRouter = Router()

joinRouter.post('/', handleJoinRequest)

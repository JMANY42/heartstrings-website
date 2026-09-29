import { Router } from 'express'
import { handleGroupMeLinkRequest, handleJoinRequest } from '../controllers/joinController.js'

export const joinRouter = Router()

joinRouter.post('/', handleJoinRequest)
joinRouter.get('/groupme', handleGroupMeLinkRequest)

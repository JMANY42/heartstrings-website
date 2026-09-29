import { Router } from 'express'
import { handleGroupMeLinkRequest, handleJoinRequest } from '../controllers/joinController.js'

export const joinRouter = Router()

// OBSOLETE: the old join form that emailed the GroupMe link. The frontend no
// longer uses it (see handleJoinRequest); kept so existing callers don't break.
joinRouter.post('/', handleJoinRequest)
joinRouter.get('/groupme', handleGroupMeLinkRequest)

import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import {
  postLinkedInSnapshot,
  getLinkedInSnapshotsHandler,
  getLinkedInReminderHandler,
  getContactStatsHandler,
} from '../controllers/statsController'

export const statsRouter = Router()

statsRouter.use(authMiddleware)
statsRouter.get('/linkedin/reminder', getLinkedInReminderHandler)
statsRouter.post('/linkedin', postLinkedInSnapshot)
statsRouter.get('/linkedin', getLinkedInSnapshotsHandler)
statsRouter.get('/contacts', getContactStatsHandler)

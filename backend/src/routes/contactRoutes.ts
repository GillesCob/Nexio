import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import * as contactController from '../controllers/contactController'
import * as messageController from '../controllers/messageController'
import { extractContact } from '../controllers/extractContactController'
import { scoreContactController } from '../controllers/scoringController'
import { suggestTemplateController } from '../controllers/templateController'
import { getRelances, autoPromoteToFollowUp } from '../controllers/relanceController'
import { suggestRelanceController } from '../controllers/relanceTemplateController'

export const contactRouter = Router()

contactRouter.use(authMiddleware)

contactRouter.post('/extract', extractContact)
contactRouter.post('/score', scoreContactController)
contactRouter.get('/relances', getRelances)
contactRouter.post('/auto-promote', autoPromoteToFollowUp)
contactRouter.post('/', contactController.createContact)
contactRouter.get('/', contactController.getContacts)
contactRouter.post('/:id/messages', messageController.createMessage)
contactRouter.get('/:id/messages', messageController.getMessages)
contactRouter.get('/:id/suggest-template', suggestTemplateController)
contactRouter.get('/:id/suggest-relance', suggestRelanceController)
contactRouter.get('/:id', contactController.getContactById)
contactRouter.patch('/:id/touch', contactController.touchContact)
contactRouter.patch('/:id', contactController.updateContact)
contactRouter.delete('/:id', contactController.deleteContact)

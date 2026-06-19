import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import * as contactController from '../controllers/contactController'

export const contactRouter = Router()

contactRouter.use(authMiddleware)

contactRouter.post('/', contactController.createContact)
contactRouter.get('/', contactController.getContacts)
contactRouter.get('/:id', contactController.getContactById)
contactRouter.patch('/:id', contactController.updateContact)
contactRouter.delete('/:id', contactController.deleteContact)

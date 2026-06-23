import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import * as jobOfferController from '../controllers/jobOfferController'

export const jobOfferRouter = Router()

jobOfferRouter.use(authMiddleware)

jobOfferRouter.post('/extract', jobOfferController.extractAndCreateJobOffer)
jobOfferRouter.get('/', jobOfferController.getJobOffers)
jobOfferRouter.patch('/:id', jobOfferController.updateJobOffer)
jobOfferRouter.delete('/:id', jobOfferController.deleteJobOffer)
jobOfferRouter.post('/:id/score', jobOfferController.scoreJobOffer)

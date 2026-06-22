import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { extractCompany } from '../controllers/companyController'

export const companyRouter = Router()

companyRouter.use(authMiddleware)

companyRouter.post('/extract', extractCompany)

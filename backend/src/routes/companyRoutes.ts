import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { extractCompany, enrichCompany, updateCompany } from '../controllers/companyController'

export const companyRouter = Router()

companyRouter.use(authMiddleware)

companyRouter.post('/extract', extractCompany)
companyRouter.patch('/:id/enrich', enrichCompany)
companyRouter.patch('/:id', updateCompany)

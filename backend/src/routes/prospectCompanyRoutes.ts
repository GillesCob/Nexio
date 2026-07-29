import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import * as prospectCompanyController from '../controllers/prospectCompanyController'

export const prospectCompanyRouter = Router()

prospectCompanyRouter.use(authMiddleware)

prospectCompanyRouter.get('/', prospectCompanyController.getProspectCompanies)
prospectCompanyRouter.post('/', prospectCompanyController.createProspectCompany)
prospectCompanyRouter.delete('/:id', prospectCompanyController.deleteProspectCompany)

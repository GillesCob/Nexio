import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import * as authController from '../controllers/authController'

export const authRouter = Router()

authRouter.post('/register', authController.register)
authRouter.post('/login', authController.login)
authRouter.post('/refresh', authController.refresh)
authRouter.post('/logout', authController.logout)
authRouter.get('/me', authMiddleware, authController.me)
authRouter.post('/forgot-password', authController.forgotPassword)
authRouter.post('/reset-password', authController.resetPassword)

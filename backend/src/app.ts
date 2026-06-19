import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { healthRouter } from './routes/healthRoutes'
import { authRouter } from './routes/authRoutes'
import { contactRouter } from './routes/contactRoutes'
import { errorMiddleware } from './middlewares/errorMiddleware'

export const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

app.use('/health', healthRouter)
app.use('/auth', authRouter)
app.use('/contacts', contactRouter)

app.use(errorMiddleware)

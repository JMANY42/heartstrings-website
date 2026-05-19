import cors from 'cors'
import express from 'express'
import { authRouter } from './routes/authRoutes.js'
import { contactRouter } from './routes/contactRoutes.js'
import { joinRouter } from './routes/joinRoutes.js'

export const app = express()
const debugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production'

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (debugEnabled) {
  app.use((request, response, next) => {
    const startTime = Date.now()
    console.debug(`[DEBUG] Incoming ${request.method} ${request.originalUrl}`)

    response.on('finish', () => {
      const duration = Date.now() - startTime
      console.debug(
        `[DEBUG] Completed ${request.method} ${request.originalUrl} with ${response.statusCode} in ${duration}ms`,
      )
    })

    next()
  })
}

app.get('/health', (_request, response) => {
  if (debugEnabled) {
    console.debug('[DEBUG] Health check endpoint called')
  }
  response.json({ status: 'ok' })
})

app.use('/api/contact', contactRouter)
app.use('/api/join', joinRouter)
app.use('/api/auth', authRouter)

app.use((_request, response) => {
  if (debugEnabled) {
    console.debug('[DEBUG] Unmatched route hit')
  }
  response.status(404).json({ message: 'Route not found' })
})

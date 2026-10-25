import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import pool from './config/database.js'

import authRoutes from './routes/authRoutes.js'
import libraryRoutes from './routes/libraryRoutes.js'

dotenv.config()

const app = express()

const PORT =
  process.env.PORT || 5000

app.use(
  cors({
    origin:
      'http://localhost:5173',
  })
)

app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message:
      'GameBacklog API is running!',
  })
})

app.get(
  '/api/health',
  (req, res) => {
    res.json({
      status: 'OK',
      message:
        'GameBacklog backend is healthy.',
    })
  }
)

app.get(
  '/api/database-test',
  async (req, res) => {
    try {
      const result =
        await pool.query(
          `
          SELECT NOW()
          AS current_time
          `
        )

      res.json({
        status: 'OK',
        message:
          'PostgreSQL connection successful!',
        databaseTime:
          result.rows[0]
            .current_time,
      })
    } catch (error) {
      console.error(error)

      res.status(500).json({
        status: 'ERROR',
        message:
          'Failed to connect to PostgreSQL.',
      })
    }
  }
)

app.use(
  '/api/auth',
  authRoutes
)

app.use(
  '/api/library',
  libraryRoutes
)

app.use((req, res) => {
  res.status(404).json({
    message:
      'API route not found.',
  })
})

app.use(
  (error, req, res, next) => {
    console.error(
      'Unhandled server error:',
      error
    )

    res.status(500).json({
      message:
        'Internal server error.',
    })
  }
)

app.listen(
  PORT,
  async () => {
    console.log(
      `GameBacklog API running on http://localhost:${PORT}`
    )

    try {
      await pool.query(
        'SELECT NOW()'
      )

      console.log(
        'PostgreSQL connected successfully!'
      )
    } catch (error) {
      console.error(
        'PostgreSQL connection failed:',
        error.message
      )
    }
  }
)
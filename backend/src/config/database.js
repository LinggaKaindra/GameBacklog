import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

const isProduction =
  process.env.NODE_ENV === 'production'

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString:
        process.env.DATABASE_URL,
      ssl: isProduction
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: Number(
        process.env.DB_PORT
      ),
      database:
        process.env.DB_NAME,
      user: process.env.DB_USER,
      password:
        process.env.DB_PASSWORD,
    })

pool.on('error', (error) => {
  console.error(
    'Unexpected PostgreSQL error:',
    error
  )
})

export default pool
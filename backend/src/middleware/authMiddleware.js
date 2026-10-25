import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

export async function authenticateToken(
  req,
  res,
  next
) {
  try {
    const authHeader =
      req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        message:
          'Authentication required.',
      })
    }

    const [
      scheme,
      token,
    ] = authHeader.split(' ')

    if (
      scheme !== 'Bearer' ||
      !token
    ) {
      return res.status(401).json({
        message:
          'Invalid authorization format.',
      })
    }

    if (
      !process.env.JWT_SECRET
    ) {
      console.error(
        'JWT_SECRET is missing.'
      )

      return res.status(500).json({
        message:
          'Server authentication configuration error.',
      })
    }

    let decoded

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      )
    } catch (error) {
      console.error(
        'JWT verification error:',
        error.message
      )

      return res.status(401).json({
        message:
          'Invalid or expired token.',
      })
    }

    const userId =
      decoded.userId ??
      decoded.id

    if (!userId) {
      return res.status(401).json({
        message:
          'Invalid token payload.',
      })
    }

    const result =
      await pool.query(
        `
        SELECT
          id,
          username,
          email,
          created_at
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [userId]
      )

    if (
      result.rows.length === 0
    ) {
      return res.status(401).json({
        message:
          'User no longer exists.',
      })
    }

    req.user =
      result.rows[0]

    next()
  } catch (error) {
    console.error(
      'Authentication middleware error:',
      error
    )

    return res.status(500).json({
      message:
        'Authentication failed.',
    })
  }
}
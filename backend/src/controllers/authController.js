import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

const SALT_ROUNDS = 12

function createToken(userId) {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        '7d',
    }
  )
}

// ==========================================
// REGISTER
// POST /api/auth/register
// ==========================================

export async function register(
  req,
  res
) {
  try {
    const {
      username,
      email,
      password,
    } = req.body

    // ========================================
    // REQUIRED FIELDS
    // ========================================

    if (
      !username ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          'Username, email, and password are required.',
      })
    }

    const cleanUsername =
      username.trim()

    const cleanEmail =
      email
        .trim()
        .toLowerCase()

    // ========================================
    // USERNAME VALIDATION
    // ========================================

    if (
      cleanUsername.length < 3
    ) {
      return res.status(400).json({
        message:
          'Username must be at least 3 characters.',
      })
    }

    if (
      cleanUsername.length > 50
    ) {
      return res.status(400).json({
        message:
          'Username cannot exceed 50 characters.',
      })
    }

    // ========================================
    // EMAIL VALIDATION
    // ========================================

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      !emailPattern.test(
        cleanEmail
      )
    ) {
      return res.status(400).json({
        message:
          'Please enter a valid email address.',
      })
    }

    // ========================================
    // PASSWORD VALIDATION
    // ========================================

    if (
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters.',
      })
    }

    // ========================================
    // CHECK EXISTING ACCOUNT
    // ========================================

    const existingUser =
      await pool.query(
        `
        SELECT
          id,
          username,
          email
        FROM users
        WHERE LOWER(email) = LOWER($1)
           OR LOWER(username) = LOWER($2)
        LIMIT 1
        `,
        [
          cleanEmail,
          cleanUsername,
        ]
      )

    if (
      existingUser.rows.length > 0
    ) {
      const existing =
        existingUser.rows[0]

      if (
        existing.email.toLowerCase() ===
        cleanEmail
      ) {
        return res.status(409).json({
          message:
            'An account with this email already exists.',
        })
      }

      return res.status(409).json({
        message:
          'This username is already taken.',
      })
    }

    // ========================================
    // HASH PASSWORD
    // ========================================

    const passwordHash =
      await bcrypt.hash(
        password,
        SALT_ROUNDS
      )

    // ========================================
    // CREATE USER
    // ========================================

    const result =
      await pool.query(
        `
        INSERT INTO users (
          username,
          email,
          password_hash
        )
        VALUES ($1, $2, $3)
        RETURNING
          id,
          username,
          email,
          created_at
        `,
        [
          cleanUsername,
          cleanEmail,
          passwordHash,
        ]
      )

    const newUser =
      result.rows[0]

    // ========================================
    // CREATE TOKEN
    // ========================================

    const token =
      createToken(
        newUser.id
      )

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(201).json({
      message:
        'Account created successfully.',

      token,

      user: newUser,
    })
  } catch (error) {
    console.error(
      'Register error:',
      error
    )

    return res.status(500).json({
      message:
        'Internal server error.',
    })
  }
}

// ==========================================
// LOGIN
// POST /api/auth/login
// ==========================================

export async function login(
  req,
  res
) {
  try {
    const {
      email,
      password,
    } = req.body

    // ========================================
    // REQUIRED FIELDS
    // ========================================

    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          'Email and password are required.',
      })
    }

    const cleanEmail =
      email
        .trim()
        .toLowerCase()

    // ========================================
    // FIND USER
    // ========================================

    const result =
      await pool.query(
        `
        SELECT
          id,
          username,
          email,
          password_hash,
          created_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [cleanEmail]
      )

    if (
      result.rows.length === 0
    ) {
      return res.status(401).json({
        message:
          'Invalid email or password.',
      })
    }

    const user =
      result.rows[0]

    // ========================================
    // CHECK PASSWORD
    // ========================================

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash
      )

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          'Invalid email or password.',
      })
    }

    // ========================================
    // CREATE TOKEN
    // ========================================

    const token =
      createToken(
        user.id
      )

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message:
        'Login successful.',

      token,

      user: {
        id: user.id,
        username:
          user.username,
        email:
          user.email,
        created_at:
          user.created_at,
      },
    })
  } catch (error) {
    console.error(
      'Login error:',
      error
    )

    return res.status(500).json({
      message:
        'Internal server error.',
    })
  }
}

// ==========================================
// GET CURRENT USER
// GET /api/auth/me
// ==========================================

export async function getMe(
  req,
  res
) {
  try {
    // protect middleware sudah
    // memastikan req.user tersedia.

    const userId =
      req.user.id

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
      return res.status(404).json({
        message:
          'User not found.',
      })
    }

    return res.status(200).json({
      user:
        result.rows[0],
    })
  } catch (error) {
    console.error(
      'Get current user error:',
      error
    )

    return res.status(500).json({
      message:
        'Internal server error.',
    })
  }
}
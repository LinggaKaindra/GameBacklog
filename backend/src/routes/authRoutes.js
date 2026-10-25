import express from 'express'

import {
  register,
  login,
  getMe,
} from '../controllers/authController.js'

import {
  authenticateToken,
} from '../middleware/authMiddleware.js'

const router =
  express.Router()

// Register
// POST /api/auth/register
router.post(
  '/register',
  register
)

// Login
// POST /api/auth/login
router.post(
  '/login',
  login
)

// Current logged-in user
// GET /api/auth/me
router.get(
  '/me',
  authenticateToken,
  getMe
)

export default router
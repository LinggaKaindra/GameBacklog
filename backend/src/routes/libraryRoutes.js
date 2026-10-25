import express from 'express'

import {
  getLibrary,
  addGame,
  updateGame,
  deleteGame,
} from '../controllers/libraryController.js'

import {
  authenticateToken,
} from '../middleware/authMiddleware.js'

const router =
  express.Router()

// Semua endpoint library
// membutuhkan user yang sudah login.
router.use(
  authenticateToken
)

// GET /api/library
router.get(
  '/',
  getLibrary
)

// POST /api/library
router.post(
  '/',
  addGame
)

// PATCH /api/library/:id
router.patch(
  '/:id',
  updateGame
)

// DELETE /api/library/:id
router.delete(
  '/:id',
  deleteGame
)

export default router
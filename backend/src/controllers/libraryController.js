import pool from '../config/database.js'

// ============================================
// HELPER
// ============================================

function normalizeGenres(
  genres
) {
  if (!Array.isArray(genres)) {
    return []
  }

  return genres
    .map((genre) => {
      if (
        typeof genre === 'string'
      ) {
        return genre
      }

      if (
        genre &&
        typeof genre === 'object'
      ) {
        return genre.name || ''
      }

      return ''
    })
    .filter(Boolean)
}

// ============================================
// GET LIBRARY
// ============================================

export async function getLibrary(
  req,
  res
) {
  try {
    const userId = req.user.id

    const result =
      await pool.query(
        `
        SELECT
          id,
          user_id,
          rawg_game_id,
          game_name,
          background_image,
          released,
          rawg_rating,
          genres,
          status,
          personal_rating,
          added_at,
          updated_at
        FROM user_games
        WHERE user_id = $1
        ORDER BY added_at DESC
        `,
        [userId]
      )

    return res.status(200).json(
      result.rows
    )
  } catch (error) {
    console.error(
      'Get library error:',
      error
    )

    return res.status(500).json({
      message:
        'Failed to load library.',
    })
  }
}

// ============================================
// ADD GAME
// ============================================

export async function addGame(
  req,
  res
) {
  try {
    const userId = req.user.id

    const {
      rawg_game_id,
      game_name,
      background_image = null,
      released = null,
      rawg_rating = null,
      genres = [],
      status = 'Wishlist',
      personal_rating = null,
    } = req.body

    console.log(
      'Add game request:',
      req.body
    )

    if (
      rawg_game_id ===
        undefined ||
      rawg_game_id === null ||
      rawg_game_id === '' ||
      !game_name ||
      !String(
        game_name
      ).trim()
    ) {
      return res.status(400).json({
        message:
          'Game ID and game name are required.',
      })
    }

    const numericGameId =
      Number(rawg_game_id)

    if (
      !Number.isFinite(
        numericGameId
      )
    ) {
      return res.status(400).json({
        message:
          'Game ID must be a valid number.',
      })
    }

    const allowedStatuses = [
      'Playing',
      'Completed',
      'Wishlist',
      'On Hold',
      'Dropped',
    ]

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          'Invalid game status.',
      })
    }

    let rating = null

    if (
      personal_rating !==
        null &&
      personal_rating !==
        undefined &&
      personal_rating !== ''
    ) {
      rating =
        Number(
          personal_rating
        )

      if (
        !Number.isFinite(
          rating
        ) ||
        rating < 1 ||
        rating > 10
      ) {
        return res.status(400).json({
          message:
            'Personal rating must be between 1 and 10.',
        })
      }
    }

    const normalizedGenres =
      normalizeGenres(genres)

    const existingGame =
      await pool.query(
        `
        SELECT id
        FROM user_games
        WHERE
          user_id = $1
          AND rawg_game_id = $2
        LIMIT 1
        `,
        [
          userId,
          numericGameId,
        ]
      )

    if (
      existingGame.rows
        .length > 0
    ) {
      return res.status(409).json({
        message:
          'Game is already in your library.',
      })
    }

    const result =
      await pool.query(
        `
        INSERT INTO user_games (
          user_id,
          rawg_game_id,
          game_name,
          background_image,
          released,
          rawg_rating,
          genres,
          status,
          personal_rating
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7::jsonb,
          $8,
          $9
        )
        RETURNING
          id,
          user_id,
          rawg_game_id,
          game_name,
          background_image,
          released,
          rawg_rating,
          genres,
          status,
          personal_rating,
          added_at,
          updated_at
        `,
        [
          userId,
          numericGameId,
          String(
            game_name
          ).trim(),
          background_image,
          released,
          rawg_rating,
          JSON.stringify(
            normalizedGenres
          ),
          status,
          rating,
        ]
      )

    return res.status(201).json({
      message:
        'Game added to library.',
      game: result.rows[0],
    })
  } catch (error) {
    console.error(
      'Add game error:',
      error
    )

    return res.status(500).json({
      message:
        'Failed to add game.',
    })
  }
}

// ============================================
// UPDATE GAME
// ============================================

export async function updateGame(
  req,
  res
) {
  try {
    const userId =
      req.user.id

    const gameId =
      Number(req.params.id)

    const {
      status,
      personal_rating,
    } = req.body

    if (
      !Number.isFinite(gameId)
    ) {
      return res.status(400).json({
        message:
          'Invalid library game ID.',
      })
    }

    const allowedStatuses = [
      'Playing',
      'Completed',
      'Wishlist',
      'On Hold',
      'Dropped',
    ]

    if (
      status !== undefined &&
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          'Invalid game status.',
      })
    }

    let rating

    if (
      personal_rating === null ||
      personal_rating === '' ||
      personal_rating ===
        undefined
    ) {
      rating = null
    } else {
      rating =
        Number(
          personal_rating
        )

      if (
        !Number.isFinite(
          rating
        ) ||
        rating < 1 ||
        rating > 10
      ) {
        return res.status(400).json({
          message:
            'Personal rating must be between 1 and 10.',
        })
      }
    }

    const result =
      await pool.query(
        `
        UPDATE user_games
        SET
          status =
            COALESCE(
              $1,
              status
            ),
          personal_rating = $2,
          updated_at = NOW()
        WHERE
          id = $3
          AND user_id = $4
        RETURNING
          id,
          user_id,
          rawg_game_id,
          game_name,
          background_image,
          released,
          rawg_rating,
          genres,
          status,
          personal_rating,
          added_at,
          updated_at
        `,
        [
          status ?? null,
          rating,
          gameId,
          userId,
        ]
      )

    if (
      result.rows.length ===
      0
    ) {
      return res.status(404).json({
        message:
          'Game not found in your library.',
      })
    }

    return res.status(200).json({
      message:
        'Game updated successfully.',
      game: result.rows[0],
    })
  } catch (error) {
    console.error(
      'Update game error:',
      error
    )

    return res.status(500).json({
      message:
        'Failed to update game.',
    })
  }
}

// ============================================
// DELETE GAME
// ============================================

export async function deleteGame(
  req,
  res
) {
  try {
    const userId =
      req.user.id

    const gameId =
      Number(req.params.id)

    if (
      !Number.isFinite(gameId)
    ) {
      return res.status(400).json({
        message:
          'Invalid library game ID.',
      })
    }

    const result =
      await pool.query(
        `
        DELETE FROM user_games
        WHERE
          id = $1
          AND user_id = $2
        RETURNING
          id,
          rawg_game_id,
          game_name
        `,
        [
          gameId,
          userId,
        ]
      )

    if (
      result.rows.length ===
      0
    ) {
      return res.status(404).json({
        message:
          'Game not found in your library.',
      })
    }

    return res.status(200).json({
      message:
        'Game removed from library.',
      game: result.rows[0],
    })
  } catch (error) {
    console.error(
      'Delete game error:',
      error
    )

    return res.status(500).json({
      message:
        'Failed to remove game.',
    })
  }
}
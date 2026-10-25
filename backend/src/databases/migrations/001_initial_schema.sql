-- =========================================
-- GAMEBACKLOG INITIAL DATABASE SCHEMA
-- =========================================


-- =========================================
-- USERS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,

    username VARCHAR(50) NOT NULL UNIQUE,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================
-- USER GAMES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS user_games (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    rawg_game_id INTEGER NOT NULL,

    game_name VARCHAR(255) NOT NULL,

    background_image TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'Wishlist',

    personal_rating SMALLINT,

    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user_games_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT valid_game_status
        CHECK (
            status IN (
                'Wishlist',
                'Playing',
                'Completed',
                'On Hold',
                'Dropped'
            )
        ),

    CONSTRAINT valid_personal_rating
        CHECK (
            personal_rating IS NULL
            OR personal_rating BETWEEN 1 AND 10
        ),

    CONSTRAINT unique_user_game
        UNIQUE (user_id, rawg_game_id)
);


-- =========================================
-- INDEXES
-- =========================================

CREATE INDEX IF NOT EXISTS idx_user_games_user_id
ON user_games(user_id);

CREATE INDEX IF NOT EXISTS idx_user_games_status
ON user_games(user_id, status);
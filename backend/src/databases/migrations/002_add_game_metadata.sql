-- =========================================
-- ADD GAME METADATA COLUMNS
-- =========================================

ALTER TABLE user_games
ADD COLUMN IF NOT EXISTS released DATE;

ALTER TABLE user_games
ADD COLUMN IF NOT EXISTS rawg_rating NUMERIC(3, 2);

ALTER TABLE user_games
ADD COLUMN IF NOT EXISTS genres JSONB NOT NULL DEFAULT '[]'::jsonb;

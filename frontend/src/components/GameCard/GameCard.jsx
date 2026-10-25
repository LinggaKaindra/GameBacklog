import { Link } from 'react-router-dom'
import './GameCard.css'

function GameCard({ game }) {
  const genres =
    game.genres?.map((genre) => genre.name).join(', ') ||
    'Unknown Genre'

  const releaseYear = game.released
    ? new Date(game.released).getFullYear()
    : 'TBA'

  return (
    <Link
      to={`/game/${game.id}`}
      className="game-card-link"
    >
      <article className="game-card">
        <div className="game-cover">
          {game.background_image ? (
            <img
              src={game.background_image}
              alt={game.name}
            />
          ) : (
            <div className="no-cover">
              No Image Available
            </div>
          )}
        </div>

        <div className="game-info">
          <h3>{game.name}</h3>

          <p className="game-genre">
            {genres}
          </p>

          <div className="game-meta">
            <span>⭐ {game.rating || 'N/A'}</span>
            <span>{releaseYear}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default GameCard
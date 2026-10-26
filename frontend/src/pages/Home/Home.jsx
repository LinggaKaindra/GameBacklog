import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import GameCard from '../../components/GameCard/GameCard'
import { getGames } from '../../services/gameApi'

import './Home.css'

function Home() {
  const [popularGames, setPopularGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadPopularGames() {
      try {
        setLoading(true)
        setError('')

        const games = await getGames()

        if (isMounted) {
          setPopularGames(games.slice(0, 4))
        }
      } catch (err) {
        console.error('Failed to load popular games:', err)

        if (isMounted) {
          setError('Unable to load popular games right now.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPopularGames()

    return () => {
      isMounted = false
    }
  }, [])

  const showPlaceholders =
    loading || error || popularGames.length === 0

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-badge">
          YOUR PERSONAL GAME TRACKER
        </div>

        <h1>
          Your games.
          <br />
          Your journey.
          <br />
          <span>All in one place.</span>
        </h1>

        <p>
          Track what you play, organize your backlog, and keep
          every game you want to experience in one place.
        </p>

        <div className="hero-actions">
          <Link to="/discover" className="primary-button">
            Discover Games
          </Link>

          <Link to="/library" className="secondary-button">
            My Library
          </Link>
        </div>
      </section>

      <section className="popular-section">
        <div className="section-heading">
          <div>
            <p className="section-label">DISCOVER</p>
            <h2>Currently Popular</h2>
          </div>

          <Link to="/discover">
            View all →
          </Link>
        </div>

        {error && (
          <p className="popular-error">
            {error}
          </p>
        )}

        <div className="game-grid">
          {showPlaceholders
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="game-card-placeholder"
                >
                  <span>
                    {loading ? 'Loading...' : 'Game Cover'}
                  </span>
                </div>
              ))
            : popularGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                />
              ))}
        </div>
      </section>
    </main>
  )
}

export default Home

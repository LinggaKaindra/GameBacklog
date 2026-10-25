import { Link } from 'react-router-dom'
import './Home.css'

function Home() {

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

        <div className="game-grid">
          <div className="game-card-placeholder">
            <span>Game Cover</span>
          </div>

          <div className="game-card-placeholder">
            <span>Game Cover</span>
          </div>

          <div className="game-card-placeholder">
            <span>Game Cover</span>
          </div>

          <div className="game-card-placeholder">
            <span>Game Cover</span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
import {
  useEffect,
  useState,
} from 'react'

import GameCard from '../../components/GameCard/GameCard'

import {
  getGames,
} from '../../services/gameApi'

import './Discover.css'

const GENRES = [
  'All',
  'Action',
  'Adventure',
  'RPG',
  'Strategy',
  'Shooter',
  'Simulation',
  'Sports',
  'Racing',
  'Puzzle',
]

function Discover() {
  const [games, setGames] =
    useState([])

  const [search, setSearch] =
    useState('')

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState('')

  const [
    selectedGenre,
    setSelectedGenre,
  ] = useState('All')

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  // =========================================
  // SEARCH DEBOUNCE
  // =========================================

  useEffect(() => {
    const timeout =
      setTimeout(() => {
        setDebouncedSearch(
          search.trim()
        )
      }, 500)

    return () => {
      clearTimeout(timeout)
    }
  }, [search])

  // =========================================
  // LOAD GAMES FROM RAWG
  // =========================================

  useEffect(() => {
    let cancelled = false

    async function loadGames() {
      try {
        setLoading(true)
        setError('')

        const data =
          await getGames(
            debouncedSearch,
            selectedGenre
          )

        if (!cancelled) {
          setGames(data)
        }
      } catch (error) {
        console.error(
          'Discover error:',
          error
        )

        if (!cancelled) {
          setGames([])

          setError(
            error.message ||
              'Failed to load games.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadGames()

    return () => {
      cancelled = true
    }
  }, [
    debouncedSearch,
    selectedGenre,
  ])

  // =========================================
  // GENRE
  // =========================================

  function handleGenreChange(
    genre
  ) {
    setSelectedGenre(genre)
  }

  // =========================================
  // CLEAR SEARCH
  // =========================================

  function handleClearSearch() {
    setSearch('')
    setDebouncedSearch('')
  }

  // =========================================
  // RESET FILTERS
  // =========================================

  function handleReset() {
    setSearch('')
    setDebouncedSearch('')
    setSelectedGenre('All')
  }

  // =========================================
  // RESULT TITLE
  // =========================================

  function getResultTitle() {
    if (
      debouncedSearch &&
      selectedGenre !== 'All'
    ) {
      return `${selectedGenre} games matching "${debouncedSearch}"`
    }

    if (debouncedSearch) {
      return `Search results for "${debouncedSearch}"`
    }

    if (
      selectedGenre !== 'All'
    ) {
      return `${selectedGenre} Games`
    }

    return 'Popular Games'
  }

  return (
    <main className="discover-page">
      <section className="discover-header">
        <p className="discover-eyebrow">
          Find Your Next Game
        </p>

        <h1>
          Discover Games
        </h1>

        <p className="discover-subtitle">
          Search and explore
          games, then add your
          favorites to your
          personal backlog.
        </p>
      </section>

      {/* SEARCH */}

      <section className="discover-tools">
        <div className="discover-search">
          <span className="search-icon">
            🔎
          </span>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search games..."
            aria-label="Search games"
          />

          {search && (
            <button
              type="button"
              className="clear-search-button"
              onClick={
                handleClearSearch
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </section>

      {/* GENRES */}

      <section className="genre-section">
        <div className="genre-header">
          <h2>
            Genres
          </h2>

          <span>
            {selectedGenre}
          </span>
        </div>

        <div className="genre-filters">
          {GENRES.map(
            (genre) => (
              <button
                key={genre}
                type="button"
                className={
                  selectedGenre ===
                  genre
                    ? 'genre-button active'
                    : 'genre-button'
                }
                onClick={() =>
                  handleGenreChange(
                    genre
                  )
                }
              >
                {genre}
              </button>
            )
          )}
        </div>
      </section>

      {/* RESULTS */}

      <section>
        <div className="discover-results-header">
          <div>
            <h2>
              {getResultTitle()}
            </h2>

            {!loading &&
              !error && (
                <p>
                  {games.length}{' '}
                  {games.length === 1
                    ? 'game'
                    : 'games'}{' '}
                  shown
                </p>
              )}
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="discover-state">
            <div className="discover-loader" />

            <h3>
              Loading games...
            </h3>

            <p>
              Searching the RAWG
              game database.
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loading &&
          error && (
            <div className="discover-state">
              <div className="discover-empty-icon">
                ⚠️
              </div>

              <h3>
                Unable to load
                games
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="reset-discover-button"
                onClick={
                  handleReset
                }
              >
                Reset Filters
              </button>
            </div>
          )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          games.length === 0 && (
            <div className="discover-state">
              <div className="discover-empty-icon">
                🎮
              </div>

              <h3>
                No games found
              </h3>

              <p>
                Try another
                search term or
                genre.
              </p>

              <button
                type="button"
                className="reset-discover-button"
                onClick={
                  handleReset
                }
              >
                Reset Filters
              </button>
            </div>
          )}

        {/* GAME GRID */}

        {!loading &&
          !error &&
          games.length > 0 && (
            <div className="discover-grid">
              {games.map(
                (game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                  />
                )
              )}
            </div>
          )}
      </section>
    </main>
  )
}

export default Discover
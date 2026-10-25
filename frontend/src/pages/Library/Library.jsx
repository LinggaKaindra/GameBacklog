import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  deleteBackendGame,
  getBackendLibrary,
  updateBackendGame,
} from '../../services/backendApi'

import './Library.css'

const STATUS_OPTIONS = [
  'Playing',
  'Completed',
  'Wishlist',
  'On Hold',
  'Dropped',
]

const FILTER_OPTIONS = [
  'All',
  ...STATUS_OPTIONS,
]

function Library() {
  const [games, setGames] =
    useState([])

  const [activeFilter, setActiveFilter] =
    useState('All')

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [savingId, setSavingId] =
    useState(null)

  const [removingId, setRemovingId] =
    useState(null)

  const [message, setMessage] =
    useState('')

  useEffect(() => {
    async function loadLibrary() {
      try {
        setLoading(true)
        setError('')

        const data =
          await getBackendLibrary()

        const libraryGames =
          Array.isArray(data)
            ? data
            : Array.isArray(
                  data?.games
                )
              ? data.games
              : Array.isArray(
                    data?.library
                  )
                ? data.library
                : []

        setGames(libraryGames)
      } catch (error) {
        console.error(
          'Library load error:',
          error
        )

        setError(
          error.message ||
            'Failed to load library.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadLibrary()
  }, [])

  const filteredGames =
    useMemo(() => {
      if (
        activeFilter === 'All'
      ) {
        return games
      }

      return games.filter(
        (game) =>
          game.status ===
          activeFilter
      )
    }, [
      games,
      activeFilter,
    ])

  function updateLocalGame(
    gameId,
    field,
    value
  ) {
    setGames(
      (currentGames) =>
        currentGames.map(
          (game) =>
            game.id === gameId
              ? {
                  ...game,
                  [field]: value,
                }
              : game
        )
    )
  }

  async function handleSave(
    game
  ) {
    try {
      setSavingId(game.id)
      setMessage('')
      setError('')

      const rating =
        game.personal_rating ===
          '' ||
        game.personal_rating ===
          null ||
        game.personal_rating ===
          undefined
          ? null
          : Number(
              game.personal_rating
            )

      const data =
        await updateBackendGame(
          game.id,
          {
            status:
              game.status,
            personal_rating:
              rating,
          }
        )

      const updatedGame =
        data?.game || data

      if (
        updatedGame &&
        typeof updatedGame ===
          'object'
      ) {
        setGames(
          (currentGames) =>
            currentGames.map(
              (currentGame) =>
                currentGame.id ===
                game.id
                  ? {
                      ...currentGame,
                      ...updatedGame,
                    }
                  : currentGame
            )
        )
      }

      setMessage(
        `${game.game_name} updated successfully.`
      )
    } catch (error) {
      console.error(
        'Update game error:',
        error
      )

      setError(
        error.message ||
          'Failed to update game.'
      )
    } finally {
      setSavingId(null)
    }
  }

  async function handleRemove(
    game
  ) {
    const confirmed =
      window.confirm(
        `Remove "${game.game_name}" from your library?`
      )

    if (!confirmed) {
      return
    }

    try {
      setRemovingId(game.id)
      setMessage('')
      setError('')

      await deleteBackendGame(
        game.id
      )

      setGames(
        (currentGames) =>
          currentGames.filter(
            (currentGame) =>
              currentGame.id !==
              game.id
          )
      )

      setMessage(
        `${game.game_name} removed from your library.`
      )
    } catch (error) {
      console.error(
        'Remove game error:',
        error
      )

      setError(
        error.message ||
          'Failed to remove game.'
      )
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <main className="library-page">
        <div className="library-state">
          <div className="library-loader" />

          <h2>
            Loading your library
          </h2>

          <p>
            Getting your games
            from GameBacklog...
          </p>
        </div>
      </main>
    )
  }

  if (error && games.length === 0) {
    return (
      <main className="library-page">
        <div className="library-state">
          <h2>
            Unable to load library
          </h2>

          <p>{error}</p>

          <Link
            to="/login"
            className="library-login-link"
          >
            Go to Login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="library-page">
      <section className="library-container">
        <header className="library-header">
          <div>
            <p className="library-eyebrow">
              Your Collection
            </p>

            <h1>
              My Library
            </h1>

            <p className="library-subtitle">
              Track your games,
              update their status,
              and rate your
              experience.
            </p>
          </div>

          <div className="library-count">
            <strong>
              {games.length}
            </strong>

            <span>
              {games.length === 1
                ? 'Game'
                : 'Games'}
            </span>
          </div>
        </header>

        <div className="library-filters">
          {FILTER_OPTIONS.map(
            (filter) => (
              <button
                key={filter}
                type="button"
                className={
                  activeFilter ===
                  filter
                    ? 'library-filter active'
                    : 'library-filter'
                }
                onClick={() =>
                  setActiveFilter(
                    filter
                  )
                }
              >
                {filter}
              </button>
            )
          )}
        </div>

        {message && (
          <div className="library-message success">
            {message}
          </div>
        )}

        {error && (
          <div className="library-message error">
            {error}
          </div>
        )}

        {games.length === 0 ? (
          <div className="library-empty">
            <div className="library-empty-icon">
              🎮
            </div>

            <h2>
              Your library is empty
            </h2>

            <p>
              Discover games and
              start building your
              personal backlog.
            </p>

            <Link
              to="/discover"
              className="library-discover-button"
            >
              Discover Games
            </Link>
          </div>
        ) : filteredGames.length ===
          0 ? (
          <div className="library-empty">
            <h2>
              No games found
            </h2>

            <p>
              You don't have any
              games with the status
              "{activeFilter}".
            </p>

            <button
              type="button"
              className="library-discover-button"
              onClick={() =>
                setActiveFilter(
                  'All'
                )
              }
            >
              Show All Games
            </button>
          </div>
        ) : (
          <div className="library-grid">
            {filteredGames.map(
              (game) => {
                const isSaving =
                  savingId ===
                  game.id

                const isRemoving =
                  removingId ===
                  game.id

                return (
                  <article
                    key={game.id}
                    className="library-card"
                  >
                    <Link
                      to={`/game/${game.rawg_game_id}`}
                      className="library-card-image-link"
                    >
                      <div className="library-card-image-wrapper">
                        {game.background_image ? (
                          <img
                            src={
                              game.background_image
                            }
                            alt={
                              game.game_name
                            }
                            className="library-card-image"
                          />
                        ) : (
                          <div className="library-card-placeholder">
                            🎮
                          </div>
                        )}

                        <div className="library-card-overlay">
                          View Game
                        </div>
                      </div>
                    </Link>

                    <div className="library-card-content">
                      <Link
                        to={`/game/${game.rawg_game_id}`}
                        className="library-card-title-link"
                      >
                        <h2 className="library-card-title">
                          {
                            game.game_name
                          }
                        </h2>
                      </Link>

                      <div className="library-card-meta">
                        {game.released && (
                          <span>
                            Released:{' '}
                            {String(
                              game.released
                            ).slice(
                              0,
                              10
                            )}
                          </span>
                        )}

                        {game.rawg_rating !==
                          null &&
                          game.rawg_rating !==
                            undefined && (
                            <span>
                              RAWG:{' '}
                              {
                                game.rawg_rating
                              }
                              /5
                            </span>
                          )}
                      </div>

                      <div className="library-form">
                        <div className="library-field">
                          <label
                            htmlFor={`status-${game.id}`}
                          >
                            Status
                          </label>

                          <select
                            id={`status-${game.id}`}
                            value={
                              game.status ||
                              'Wishlist'
                            }
                            onChange={(
                              event
                            ) =>
                              updateLocalGame(
                                game.id,
                                'status',
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            {STATUS_OPTIONS.map(
                              (
                                status
                              ) => (
                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {
                                    status
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div className="library-field">
                          <label
                            htmlFor={`rating-${game.id}`}
                          >
                            Personal Rating
                          </label>

                          <select
                            id={`rating-${game.id}`}
                            value={
                              game.personal_rating ??
                              ''
                            }
                            onChange={(
                              event
                            ) =>
                              updateLocalGame(
                                game.id,
                                'personal_rating',
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Not Rated
                            </option>

                            {Array.from(
                              {
                                length:
                                  10,
                              },
                              (
                                _,
                                index
                              ) =>
                                index +
                                1
                            ).map(
                              (
                                rating
                              ) => (
                                <option
                                  key={
                                    rating
                                  }
                                  value={
                                    rating
                                  }
                                >
                                  {
                                    rating
                                  }{' '}
                                  / 10
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="library-card-actions">
                        <button
                          type="button"
                          className="library-save-button"
                          disabled={
                            isSaving ||
                            isRemoving
                          }
                          onClick={() =>
                            handleSave(
                              game
                            )
                          }
                        >
                          {isSaving
                            ? 'Saving...'
                            : 'Save Changes'}
                        </button>

                        <button
                          type="button"
                          className="library-remove-button"
                          disabled={
                            isSaving ||
                            isRemoving
                          }
                          onClick={() =>
                            handleRemove(
                              game
                            )
                          }
                        >
                          {isRemoving
                            ? 'Removing...'
                            : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              }
            )}
          </div>
        )}
      </section>
    </main>
  )
}

export default Library
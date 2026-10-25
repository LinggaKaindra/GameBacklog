import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  getGameDetails,
} from '../../services/gameApi'

import {
  addBackendGame,
  deleteBackendGame,
  getBackendLibrary,
  updateBackendGame,
} from '../../services/backendApi'

import {
  useAuth,
} from '../../context/AuthContext'

import './GameDetail.css'

const STATUS_OPTIONS = [
  'Playing',
  'Completed',
  'Wishlist',
  'On Hold',
  'Dropped',
]

function GameDetail() {
  const { id } = useParams()

  const {
    isAuthenticated,
    loading: authLoading,
  } = useAuth()

  const [game, setGame] =
    useState(null)

  const [
    libraryGame,
    setLibraryGame,
  ] = useState(null)

  const [status, setStatus] =
    useState('Wishlist')

  const [
    personalRating,
    setPersonalRating,
  ] = useState('')

  const [loading, setLoading] =
    useState(true)

  const [
    libraryLoading,
    setLibraryLoading,
  ] = useState(false)

  const [saving, setSaving] =
    useState(false)

  const [removing, setRemoving] =
    useState(false)

  const [error, setError] =
    useState('')

  const [
    libraryError,
    setLibraryError,
  ] = useState('')

  const [message, setMessage] =
    useState('')

  // ==========================================
  // LOAD GAME DETAILS
  // ==========================================

  useEffect(() => {
    let cancelled = false

    async function loadGame() {
      try {
        setLoading(true)
        setError('')

        const data =
          await getGameDetails(id)

        if (!cancelled) {
          setGame(data)
        }
      } catch (error) {
        console.error(
          'Game details error:',
          error
        )

        if (!cancelled) {
          setError(
            error.message ||
              'Failed to load game details.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadGame()

    return () => {
      cancelled = true
    }
  }, [id])

  // ==========================================
  // CHECK LIBRARY
  // ==========================================

  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated ||
      !game
    ) {
      return
    }

    let cancelled = false

    async function loadLibraryStatus() {
      try {
        setLibraryLoading(true)
        setLibraryError('')

        const response =
          await getBackendLibrary()

        const games =
          Array.isArray(response)
            ? response
            : Array.isArray(
                  response?.games
                )
              ? response.games
              : Array.isArray(
                    response?.library
                  )
                ? response.library
                : []

        const found =
          games.find(
            (item) =>
              Number(
                item.rawg_game_id
              ) ===
              Number(game.id)
          )

        if (cancelled) {
          return
        }

        if (found) {
          setLibraryGame(found)

          setStatus(
            found.status ||
              'Wishlist'
          )

          setPersonalRating(
            found.personal_rating ??
              ''
          )
        } else {
          setLibraryGame(null)
          setStatus('Wishlist')
          setPersonalRating('')
        }
      } catch (error) {
        console.error(
          'Library unavailable:',
          error
        )

        if (!cancelled) {
          setLibraryError(
            error.message ||
              'Unable to check library.'
          )
        }
      } finally {
        if (!cancelled) {
          setLibraryLoading(false)
        }
      }
    }

    loadLibraryStatus()

    return () => {
      cancelled = true
    }
  }, [
    game,
    isAuthenticated,
    authLoading,
  ])

  // ==========================================
  // ADD GAME
  // ==========================================

  async function handleAdd() {
    if (!game) {
      return
    }

    if (
      game.id === undefined ||
      game.id === null ||
      !game.name
    ) {
      setLibraryError(
        'Game data is incomplete. Please reload the page.'
      )

      return
    }

    try {
      setSaving(true)
      setMessage('')
      setLibraryError('')

      const gameData = {
        rawg_game_id:
          Number(game.id),

        game_name:
          String(game.name),

        background_image:
          game.background_image ||
          null,

        released:
          game.released ||
          null,

        rawg_rating:
          game.rating ===
            undefined ||
          game.rating === null
            ? null
            : Number(
                game.rating
              ),

        genres:
          Array.isArray(
            game.genres
          )
            ? game.genres
                .map(
                  (genre) =>
                    genre?.name
                )
                .filter(Boolean)
            : [],

        status,

        personal_rating:
          personalRating === ''
            ? null
            : Number(
                personalRating
              ),
      }

      console.log(
        'Game object:',
        game
      )

      console.log(
        'Sending game:',
        gameData
      )

      const response =
        await addBackendGame(
          gameData
        )

      const addedGame =
        response?.game ||
        response

      setLibraryGame(
        addedGame
      )

      if (
        addedGame?.status
      ) {
        setStatus(
          addedGame.status
        )
      }

      setPersonalRating(
        addedGame
          ?.personal_rating ??
          ''
      )

      setMessage(
        `${game.name} added to your library!`
      )
    } catch (error) {
      console.error(
        'Add game error:',
        error
      )

      setLibraryError(
        error.message ||
          'Failed to add game.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ==========================================
  // UPDATE GAME
  // ==========================================

  async function handleUpdate() {
    if (!libraryGame?.id) {
      setLibraryError(
        'Library game ID is missing.'
      )

      return
    }

    try {
      setSaving(true)
      setMessage('')
      setLibraryError('')

      const response =
        await updateBackendGame(
          libraryGame.id,
          {
            status,

            personal_rating:
              personalRating === ''
                ? null
                : Number(
                    personalRating
                  ),
          }
        )

      const updatedGame =
        response?.game ||
        response

      setLibraryGame(
        (current) => ({
          ...current,
          ...updatedGame,
        })
      )

      setMessage(
        `${game.name} updated successfully!`
      )
    } catch (error) {
      console.error(
        'Update game error:',
        error
      )

      setLibraryError(
        error.message ||
          'Failed to update game.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ==========================================
  // REMOVE GAME
  // ==========================================

  async function handleRemove() {
    if (!libraryGame?.id) {
      return
    }

    const confirmed =
      window.confirm(
        `Remove "${game.name}" from your library?`
      )

    if (!confirmed) {
      return
    }

    try {
      setRemoving(true)
      setMessage('')
      setLibraryError('')

      await deleteBackendGame(
        libraryGame.id
      )

      setLibraryGame(null)
      setStatus('Wishlist')
      setPersonalRating('')

      setMessage(
        `${game.name} removed from your library.`
      )
    } catch (error) {
      console.error(
        'Remove game error:',
        error
      )

      setLibraryError(
        error.message ||
          'Failed to remove game.'
      )
    } finally {
      setRemoving(false)
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="game-detail-page">
        <div className="game-detail-state">
          <div className="game-detail-loader" />

          <h2>
            Loading game
          </h2>

          <p>
            Getting game details...
          </p>
        </div>
      </main>
    )
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !game) {
    return (
      <main className="game-detail-page">
        <div className="game-detail-state">
          <h2>
            Something went wrong
          </h2>

          <p>
            {error ||
              'Failed to load game details.'}
          </p>

          <Link
            to="/discover"
            className="game-detail-back-button"
          >
            Back to Discover
          </Link>
        </div>
      </main>
    )
  }

  const genres =
    game.genres
      ?.map(
        (genre) =>
          genre.name
      )
      .filter(Boolean)
      .join(', ') ||
    'Unknown'

  const developers =
    game.developers
      ?.map(
        (developer) =>
          developer.name
      )
      .filter(Boolean)
      .join(', ') ||
    'Unknown'

  const platforms =
    game.platforms
      ?.map(
        (item) =>
          item.platform?.name
      )
      .filter(Boolean)
      .join(', ') ||
    'Unknown'

  return (
    <main className="game-detail-page">
      <section
        className="game-detail-hero"
        style={{
          backgroundImage:
            game.background_image
              ? `
                linear-gradient(
                  90deg,
                  rgba(14, 16, 21, 0.96) 0%,
                  rgba(14, 16, 21, 0.72) 45%,
                  rgba(14, 16, 21, 0.4) 100%
                ),
                linear-gradient(
                  0deg,
                  #0e1015 0%,
                  transparent 60%
                ),
                url("${game.background_image}")
              `
              : undefined,
        }}
      >
        <div className="game-detail-hero-inner">
          <Link
            to="/discover"
            className="game-detail-back-link"
          >
            ← Back to Discover
          </Link>

          <div className="game-detail-hero-content">
            <p className="game-detail-genres">
              {genres}
            </p>

            <h1>
              {game.name}
            </h1>

            <div className="game-detail-badges">
              <span className="game-detail-badge">
                ⭐{' '}
                {game.rating ??
                  'N/A'}{' '}
                / 5
              </span>

              {game.released && (
                <span className="game-detail-badge">
                  Released:{' '}
                  {game.released}
                </span>
              )}

              {game.metacritic && (
                <span className="game-detail-badge">
                  Metacritic:{' '}
                  {game.metacritic}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="game-detail-container">
        <div className="game-detail-main-column">
          <section className="game-library-panel">
            <div className="game-library-heading">
              <div>
                <p className="game-library-eyebrow">
                  Personal Collection
                </p>

                <h2>
                  {libraryGame
                    ? 'Your Library'
                    : 'Add to your Library'}
                </h2>
              </div>

              {libraryGame && (
                <span className="game-library-badge">
                  ✓ In Library
                </span>
              )}
            </div>

            {authLoading ? (
              <p className="game-library-info">
                Checking authentication...
              </p>
            ) : !isAuthenticated ? (
              <div className="game-library-login">
                <p>
                  Login to add this
                  game to your
                  personal library.
                </p>

                <Link
                  to="/login"
                  className="game-library-login-button"
                >
                  Login to Continue
                </Link>
              </div>
            ) : libraryLoading ? (
              <p className="game-library-info">
                Checking your library...
              </p>
            ) : (
              <>
                <div className="game-library-form">
                  <div className="game-library-field">
                    <label htmlFor="game-status">
                      Status
                    </label>

                    <select
                      id="game-status"
                      value={status}
                      onChange={(
                        event
                      ) =>
                        setStatus(
                          event.target
                            .value
                        )
                      }
                    >
                      {STATUS_OPTIONS.map(
                        (
                          option
                        ) => (
                          <option
                            key={
                              option
                            }
                            value={
                              option
                            }
                          >
                            {
                              option
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {libraryGame && (
                    <div className="game-library-field">
                      <label htmlFor="personal-rating">
                        Personal Rating
                      </label>

                      <select
                        id="personal-rating"
                        value={
                          personalRating
                        }
                        onChange={(
                          event
                        ) =>
                          setPersonalRating(
                            event.target
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
                            index + 1
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
                  )}
                </div>

                <div className="game-library-actions">
                  {!libraryGame ? (
                    <button
                      type="button"
                      className="game-library-primary-button"
                      onClick={
                        handleAdd
                      }
                      disabled={
                        saving
                      }
                    >
                      {saving
                        ? 'Adding...'
                        : '+ Add to Library'}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="game-library-primary-button"
                        onClick={
                          handleUpdate
                        }
                        disabled={
                          saving ||
                          removing
                        }
                      >
                        {saving
                          ? 'Saving...'
                          : 'Save Changes'}
                      </button>

                      <button
                        type="button"
                        className="game-library-remove-button"
                        onClick={
                          handleRemove
                        }
                        disabled={
                          saving ||
                          removing
                        }
                      >
                        {removing
                          ? 'Removing...'
                          : 'Remove'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {message && (
              <div className="game-library-message success">
                {message}
              </div>
            )}

            {libraryError && (
              <div className="game-library-message error">
                {libraryError}
              </div>
            )}
          </section>

          <section className="game-about-section">
            <p className="game-section-eyebrow">
              Overview
            </p>

            <h2>
              About
            </h2>

            <div
              className="game-description"
              dangerouslySetInnerHTML={{
                __html:
                  game.description ||
                  '<p>No description available.</p>',
              }}
            />
          </section>
        </div>

        <aside className="game-info-card">
          <p className="game-section-eyebrow">
            Details
          </p>

          <h2>
            Game Information
          </h2>

          <div className="game-info-list">
            <div className="game-info-item">
              <span>
                Developers
              </span>

              <strong>
                {developers}
              </strong>
            </div>

            <div className="game-info-item">
              <span>
                Platforms
              </span>

              <strong>
                {platforms}
              </strong>
            </div>

            <div className="game-info-item">
              <span>
                Released
              </span>

              <strong>
                {game.released ||
                  'Unknown'}
              </strong>
            </div>

            <div className="game-info-item">
              <span>
                Genres
              </span>

              <strong>
                {genres}
              </strong>
            </div>

            <div className="game-info-item">
              <span>
                RAWG Rating
              </span>

              <strong>
                {game.rating ??
                  'N/A'}{' '}
                / 5
              </strong>
            </div>

            <div className="game-info-item">
              <span>
                Metacritic
              </span>

              <strong>
                {game.metacritic ??
                  'N/A'}
              </strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default GameDetail
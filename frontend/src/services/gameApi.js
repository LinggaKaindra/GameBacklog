const API_KEY =
  import.meta.env
    .VITE_RAWG_API_KEY

const BASE_URL =
  'https://api.rawg.io/api'

// Mapping nama genre di UI
// ke slug genre RAWG.
const GENRE_SLUGS = {
  Action: 'action',
  Adventure: 'adventure',
  RPG: 'role-playing-games-rpg',
  Strategy: 'strategy',
  Shooter: 'shooter',
  Simulation: 'simulation',
  Sports: 'sports',
  Racing: 'racing',
  Puzzle: 'puzzle',
}

export async function getGames(
  search = '',
  genre = ''
) {
  if (!API_KEY) {
    throw new Error(
      'RAWG API key is missing.'
    )
  }

  const params =
    new URLSearchParams({
      key: API_KEY,
      page_size: '20',
    })

  const cleanSearch =
    search.trim()

  if (cleanSearch) {
    params.set(
      'search',
      cleanSearch
    )
  }

  if (
    genre &&
    genre !== 'All'
  ) {
    const genreSlug =
      GENRE_SLUGS[genre]

    if (genreSlug) {
      params.set(
        'genres',
        genreSlug
      )
    }
  }

  const response =
    await fetch(
      `${BASE_URL}/games?${params.toString()}`
    )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch games.'
    )
  }

  const data =
    await response.json()

  return Array.isArray(
    data.results
  )
    ? data.results
    : []
}

export async function getGameDetails(
  id
) {
  if (!API_KEY) {
    throw new Error(
      'RAWG API key is missing.'
    )
  }

  const params =
    new URLSearchParams({
      key: API_KEY,
    })

  const response =
    await fetch(
      `${BASE_URL}/games/${id}?${params.toString()}`
    )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch game details.'
    )
  }

  return response.json()
}
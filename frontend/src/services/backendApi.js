const BACKEND_URL =
  'http://localhost:5000'

const TOKEN_KEY =
  'gamebacklog_token'

// ============================================
// TOKEN
// ============================================

export function getToken() {
  return localStorage.getItem(
    TOKEN_KEY
  )
}

export function saveToken(token) {
  if (!token) {
    return
  }

  localStorage.setItem(
    TOKEN_KEY,
    token
  )
}

export function removeToken() {
  localStorage.removeItem(
    TOKEN_KEY
  )
}

// ============================================
// API REQUEST
// ============================================

async function apiRequest(
  endpoint,
  options = {}
) {
  const token = getToken()

  const headers = {
    'Content-Type':
      'application/json',

    ...options.headers,
  }

  if (token) {
    headers.Authorization =
      `Bearer ${token}`
  }

  const response =
    await fetch(
      `${BACKEND_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    )

  let data = {}

  try {
    data =
      await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        'Request failed.'
    )
  }

  return data
}

// ============================================
// AUTH
// ============================================

export async function registerUser(
  username,
  email,
  password
) {
  return apiRequest(
    '/api/auth/register',
    {
      method: 'POST',

      body: JSON.stringify({
        username,
        email,
        password,
      }),
    }
  )
}

export async function loginUser(
  email,
  password
) {
  return apiRequest(
    '/api/auth/login',
    {
      method: 'POST',

      body: JSON.stringify({
        email,
        password,
      }),
    }
  )
}

export async function getCurrentUser() {
  return apiRequest(
    '/api/auth/me'
  )
}

// ============================================
// LIBRARY
// ============================================

export async function getBackendLibrary() {
  return apiRequest(
    '/api/library'
  )
}

export async function addBackendGame(
  gameData
) {
  return apiRequest(
    '/api/library',
    {
      method: 'POST',

      body:
        JSON.stringify(
          gameData
        ),
    }
  )
}

export async function updateBackendGame(
  gameId,
  updates
) {
  return apiRequest(
    `/api/library/${gameId}`,
    {
      method: 'PATCH',

      body:
        JSON.stringify(
          updates
        ),
    }
  )
}

export async function deleteBackendGame(
  gameId
) {
  return apiRequest(
    `/api/library/${gameId}`,
    {
      method: 'DELETE',
    }
  )
}

export async function checkBackendHealth() {
  return apiRequest(
    '/api/health'
  )
}
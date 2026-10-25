import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  getToken,
  saveToken,
  removeToken,
  getCurrentUser,
  loginUser,
  registerUser,
} from '../services/backendApi'

const AuthContext =
  createContext(null)

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  // ========================================
  // CHECK LOGIN WHEN APP STARTS
  // ========================================

  useEffect(() => {
    async function checkAuthentication() {
      const token = getToken()

      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const data =
          await getCurrentUser()

        setUser(
          data.user
        )
      } catch (error) {
        console.error(
          'Authentication check failed:',
          error
        )

        removeToken()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuthentication()
  }, [])

  // ========================================
  // LOGIN
  // ========================================

  async function login(
    email,
    password
  ) {
    const data =
      await loginUser(
        email,
        password
      )

    if (!data.token) {
      throw new Error(
        'Login succeeded but no token was returned.'
      )
    }

    saveToken(
      data.token
    )

    if (data.user) {
      setUser(
        data.user
      )
    } else {
      const currentUser =
        await getCurrentUser()

      setUser(
        currentUser.user
      )
    }

    return data
  }

  // ========================================
  // REGISTER
  // ========================================

  async function register(
    username,
    email,
    password
  ) {
    const data =
      await registerUser(
        username,
        email,
        password
      )

    // Beberapa backend langsung
    // memberikan token setelah register.
    if (data.token) {
      saveToken(
        data.token
      )

      if (data.user) {
        setUser(
          data.user
        )
      } else {
        const currentUser =
          await getCurrentUser()

        setUser(
          currentUser.user
        )
      }
    }

    return data
  }

  // ========================================
  // LOGOUT
  // ========================================

  function logout() {
    removeToken()
    setUser(null)
  }

  const value = {
    user,

    loading,

    isAuthenticated:
      Boolean(user),

    login,

    register,

    logout,
  }

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context =
    useContext(
      AuthContext
    )

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider.'
    )
  }

  return context
}
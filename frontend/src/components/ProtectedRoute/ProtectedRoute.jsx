import {
  Navigate,
  useLocation,
} from 'react-router-dom'

import {
  useAuth,
} from '../../context/AuthContext'

function ProtectedRoute({
  children,
}) {
  const {
    isAuthenticated,
    loading,
  } = useAuth()

  const location =
    useLocation()

  if (loading) {
    return (
      <main
        style={{
          minHeight:
            'calc(100vh - 72px)',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          background: '#0e1015',
          color: '#ffffff',
        }}
      >
        <p>
          Checking authentication...
        </p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    )
  }

  return children
}

export default ProtectedRoute
import {
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../../context/AuthContext'

import './Navbar.css'

function Navbar() {
  const {
    user,
    isAuthenticated,
    loading,
    logout,
  } = useAuth()

  const navigate =
    useNavigate()

  function handleLogout() {
    logout()

    navigate('/', {
      replace: true,
    })
  }

  return (
    <nav className="navbar">
      <Link
        to="/"
        className="navbar-logo"
      >
        <span className="logo-icon">
          🎮
        </span>

        GameBacklog
      </Link>

      <div className="navbar-links">
        <NavLink
          to="/discover"
          className="navbar-link"
        >
          Discover
        </NavLink>

        {isAuthenticated && (
          <NavLink
            to="/library"
            className="navbar-link"
          >
            My Library
          </NavLink>
        )}
      </div>

      <div className="navbar-actions">
        {!loading &&
          !isAuthenticated && (
            <>
              <Link
                to="/login"
                className="login-link"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="register-button"
              >
                Sign Up
              </Link>
            </>
          )}

        {!loading &&
          isAuthenticated && (
            <>
              <div className="navbar-user">
                <span className="navbar-avatar">
                  {user?.username
                    ?.charAt(0)
                    .toUpperCase() ||
                    'U'}
                </span>

                <span className="navbar-username">
                  {user?.username}
                </span>
              </div>

              <button
                type="button"
                className="logout-button"
                onClick={
                  handleLogout
                }
              >
                Logout
              </button>
            </>
          )}
      </div>
    </nav>
  )
}

export default Navbar
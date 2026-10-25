import {
  useState,
} from 'react'

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../../context/AuthContext'

function Login() {
  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [error, setError] =
    useState('')

  const [submitting, setSubmitting] =
    useState(false)

  const { login } = useAuth()

  const navigate =
    useNavigate()

  const location =
    useLocation()

  const destination =
    location.state?.from?.pathname ||
    '/library'

  async function handleSubmit(
    event
  ) {
    event.preventDefault()

    setError('')

    try {
      setSubmitting(true)

      await login(
        email.trim(),
        password
      )

      navigate(
        destination,
        {
          replace: true,
        }
      )
    } catch (error) {
      console.error(error)

      setError(
        error.message ||
          'Login failed.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main
      style={{
        minHeight:
          'calc(100vh - 72px)',
        padding: '60px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0e1015',
        color: '#fff',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '430px',
          padding: '36px',
          border:
            '1px solid #2d3039',
          borderRadius: '16px',
          background: '#171920',
        }}
      >
        <p
          style={{
            color: '#a78bfa',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
          }}
        >
          WELCOME BACK
        </p>

        <h1
          style={{
            margin:
              '8px 0 10px',
          }}
        >
          Login
        </h1>

        <p
          style={{
            marginBottom: '28px',
            color: '#969aa6',
          }}
        >
          Login to manage your
          personal game backlog.
        </p>

        {error && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px',
              border:
                '1px solid #563039',
              borderRadius: '8px',
              background: '#281b20',
              color: '#ff9aa8',
            }}
          >
            {error}
          </div>
        )}

        <label
          htmlFor="email"
          style={{
            display: 'block',
            marginBottom: '7px',
          }}
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          placeholder="you@example.com"
          autoComplete="email"
          required
          disabled={submitting}
          style={{
            width: '100%',
            padding: '13px',
            marginBottom: '20px',
            border:
              '1px solid #343743',
            borderRadius: '9px',
            background: '#101218',
            color: '#fff',
            outline: 'none',
          }}
        />

        <label
          htmlFor="password"
          style={{
            display: 'block',
            marginBottom: '7px',
          }}
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value
            )
          }
          placeholder="Your password"
          autoComplete="current-password"
          required
          disabled={submitting}
          style={{
            width: '100%',
            padding: '13px',
            marginBottom: '24px',
            border:
              '1px solid #343743',
            borderRadius: '9px',
            background: '#101218',
            color: '#fff',
            outline: 'none',
          }}
        />

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '13px',
            border: 0,
            borderRadius: '9px',
            background: '#7957e8',
            color: '#fff',
            fontWeight: 700,
            cursor:
              submitting
                ? 'not-allowed'
                : 'pointer',
            opacity:
              submitting
                ? 0.65
                : 1,
          }}
        >
          {submitting
            ? 'Logging in...'
            : 'Login'}
        </button>

        <p
          style={{
            marginTop: '22px',
            textAlign: 'center',
            color: '#969aa6',
          }}
        >
          Don't have an account?{' '}

          <Link
            to="/register"
            style={{
              color: '#a78bfa',
              fontWeight: 600,
            }}
          >
            Sign Up
          </Link>
        </p>
      </form>
    </main>
  )
}

export default Login
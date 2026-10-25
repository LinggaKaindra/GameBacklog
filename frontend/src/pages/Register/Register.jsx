import {
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../../context/AuthContext'

function Register() {
  const [username, setUsername] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')

  const [error, setError] =
    useState('')

  const [submitting, setSubmitting] =
    useState(false)

  const { register } =
    useAuth()

  const navigate =
    useNavigate()

  async function handleSubmit(
    event
  ) {
    event.preventDefault()

    setError('')

    if (
      username.trim().length < 3
    ) {
      setError(
        'Username must be at least 3 characters.'
      )

      return
    }

    if (password.length < 8) {
      setError(
        'Password must be at least 8 characters.'
      )

      return
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        'Passwords do not match.'
      )

      return
    }

    try {
      setSubmitting(true)

      await register(
        username.trim(),
        email.trim(),
        password
      )

      navigate(
        '/login',
        {
          replace: true,
          state: {
            registrationSuccess:
              true,
          },
        }
      )
    } catch (error) {
      console.error(error)

      setError(
        error.message ||
          'Registration failed.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '13px',
    marginTop: '7px',
    border:
      '1px solid #343743',
    borderRadius: '9px',
    background: '#101218',
    color: '#fff',
    outline: 'none',
  }

  return (
    <main
      style={{
        minHeight:
          'calc(100vh - 72px)',
        padding: '60px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0e1015',
        color: '#fff',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '450px',
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
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing:
              '0.12em',
          }}
        >
          JOIN GAMEBACKLOG
        </p>

        <h1
          style={{
            margin:
              '8px 0 10px',
          }}
        >
          Create Account
        </h1>

        <p
          style={{
            marginBottom: '28px',
            color: '#969aa6',
          }}
        >
          Create an account and
          start building your game
          library.
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

        <label>
          Username

          <input
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value
              )
            }
            required
            minLength={3}
            autoComplete="username"
            placeholder="Choose a username"
            style={inputStyle}
          />
        </label>

        <div
          style={{
            height: '18px',
          }}
        />

        <label>
          Email

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            required
            autoComplete="email"
            placeholder="you@example.com"
            style={inputStyle}
          />
        </label>

        <div
          style={{
            height: '18px',
          }}
        />

        <label>
          Password

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            style={inputStyle}
          />
        </label>

        <div
          style={{
            height: '18px',
          }}
        />

        <label>
          Confirm Password

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Repeat password"
            style={inputStyle}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            marginTop: '26px',
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
            ? 'Creating Account...'
            : 'Create Account'}
        </button>

        <p
          style={{
            marginTop: '22px',
            textAlign: 'center',
            color: '#969aa6',
          }}
        >
          Already have an account?{' '}

          <Link
            to="/login"
            style={{
              color: '#a78bfa',
              fontWeight: 600,
            }}
          >
            Login
          </Link>
        </p>
      </form>
    </main>
  )
}

export default Register
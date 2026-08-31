import { useState } from 'react'
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isResetPassword, setIsResetPassword] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    city: '',
    state: '',
    country: '',
  })

  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (isForgotPassword) {
      if (!form.email) {
        setMessage('Email is required')
        return
      }

      if (!form.email.includes('@')) {
        setMessage('Please enter a valid email')
        return
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/forgot-password`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: form.email,
            }),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setMessage(data.detail || 'Something went wrong')
          return
        }

        setMessage(data.message)
        setResetToken(data.token)
        setIsForgotPassword(false)
        setIsResetPassword(true)
      } catch (error) {
        setMessage('Backend connection failed')
      }

      return
    }

    if (isResetPassword) {
      if (!newPassword) {
        setMessage('New password is required')
        return
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/reset-password`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: resetToken,
              new_password: newPassword,
            }),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setMessage(data.detail || 'Something went wrong')
          return
        }

        setMessage(data.message)
        setIsResetPassword(false)
        setIsLogin(true)
        setNewPassword('')
        setResetToken('')
      } catch (error) {
        setMessage('Backend connection failed')
      }

      return
    }

    if (isLogin) {
      if (!form.email || !form.password) {
        setMessage('Email and password are required')
        return
      }
    } else {
      const fields = [
        'name',
        'email',
        'password',
        'phone_number',
        'city',
        'state',
        'country',
      ]

      for (const field of fields) {
        if (!form[field]) {
          setMessage(`${field.replace('_', ' ')} is required`)
          return
        }
      }
    }

    if (!form.email.includes('@')) {
      setMessage('Please enter a valid email')
      return
    }

    try {
      const endpoint = isLogin
        ? `${import.meta.env.VITE_BACKEND_URL}/login`
        : `${import.meta.env.VITE_BACKEND_URL}/signup`

      const body = isLogin
        ? {
            email: form.email,
            password: form.password,
          }
        : form

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.detail || 'Something went wrong')
        return
      }

      setMessage(data.message)
    } catch (error) {
      setMessage('Backend connection failed')
    }
  }

  if (isForgotPassword) {
    return (
      <div className="auth-container">
        <h1>Forgot Password</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
          />

          <button type="submit">
            Send Reset Link
          </button>
        </form>

        <button
          className="switch-button"
          onClick={() => {
            setIsForgotPassword(false)
            setIsLogin(true)
            setMessage('')
          }}
        >
          Back to Login
        </button>

        {message && <p className="message">{message}</p>}
      </div>
    )
  }

  if (isResetPassword) {
    return (
      <div className="auth-container">
        <h1>Reset Password</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button type="submit">
            Reset Password
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    )
  }

  return (
    <div className="auth-container">
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>

      <form className="auth-form" onSubmit={handleSubmit}>

        {!isLogin && (
          <>
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
            />

            <input
              name="phone_number"
              placeholder="Phone Number"
              value={form.phone_number}
              onChange={handleChange}
            />

            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
            />

            <input
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
            />

            <input
              name="country"
              placeholder="Country"
              value={form.country}
              onChange={handleChange}
            />
          </>
        )}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit">
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      {isLogin && (
        <button
          className="switch-button"
          onClick={() => {
            setIsForgotPassword(true)
            setMessage('')
          }}
        >
          Forgot Password?
        </button>
      )}

      <button
        className="switch-button"
        onClick={() => {
          setIsLogin(!isLogin)
          setMessage('')
        }}
      >
        {isLogin
          ? 'Create a new account'
          : 'Already have an account? Login'}
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  )
}

export default App
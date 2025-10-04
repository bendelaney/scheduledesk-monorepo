'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import './page.scss'

export default function LoginPage() {
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if already authenticated
    fetch('/api/auth/jobber/check')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          router.push('/')
        } else {
          setIsChecking(false)
        }
      })
      .catch(() => {
        setIsChecking(false)
      })
  }, [router])

  const handleLogin = () => {
    window.location.href = '/api/auth/jobber'
  }

  if (isChecking) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>ScheduleDesk</h1>
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>ScheduleDesk</h1>
        <p>Connect your Jobber account to get started</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          className="login-button"
        >
          Connect with Jobber
        </button>
      </div>
    </div>
  )
}

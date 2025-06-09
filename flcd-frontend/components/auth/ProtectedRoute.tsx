'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        
        if (!token) {
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        // Verify token with backend
        const response = await fetch('http://localhost:3000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          setIsAuthenticated(true)
        } else if (response.status === 401) {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            const refreshResponse = await fetch('http://localhost:3000/api/auth/refresh-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ refreshToken })
            })

            if (refreshResponse.ok) {
              const data = await refreshResponse.json()
              localStorage.setItem('accessToken', data.accessToken)
              localStorage.setItem('refreshToken', data.refreshToken)
              setIsAuthenticated(true)
            } else {
              // Refresh failed, redirect to login
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              setIsAuthenticated(false)
            }
          } else {
            setIsAuthenticated(false)
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated === false && !isLoading) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated === false) {
    return null // Will redirect to login
  }

  return <>{children}</>
}
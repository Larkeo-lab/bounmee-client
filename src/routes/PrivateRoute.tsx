import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import DefaultLayout from '@/layouts/DefaultLayout'
import { useAuth, checkTokenExpired } from './AuthContext'

interface PrivateRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requiresLayout?: boolean
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  redirectTo = '/',
  requiresLayout = true
}) => {
  const { isAuthenticated, logout, loading } = useAuth()

  // Check token expiration
  const isExpired = React.useMemo(() => {
    try {
      const userDataStr = localStorage.getItem('authPOS')
      if (!userDataStr) return true

      const userData = JSON.parse(userDataStr)
      if (!userData?.accessToken) return true

      return checkTokenExpired(userData.accessToken)
    } catch (error) {
      console.error('Token check failed:', error)
      return true
    }
  }, [])

  useEffect(() => {
    // If token is expired, logout the user
    if (isExpired && isAuthenticated) {
      logout()
    }
  }, [isExpired, isAuthenticated, logout])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If user is not authenticated or token is expired, redirect to login
  if (!isAuthenticated || isExpired) {
    return <Navigate to={redirectTo} replace />
  }

  // If user is authenticated and token is valid, render the private route
  if (requiresLayout) {
    return <DefaultLayout>{children}</DefaultLayout>
  }

  return <>{children}</>
}

export default PrivateRoute
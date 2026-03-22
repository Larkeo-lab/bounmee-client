import React from 'react'
import { Navigate } from 'react-router-dom'

interface PublicRouteProps {
  children: React.ReactNode
  isAuthenticated?: boolean
  redirectTo?: string
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  isAuthenticated = false, 
  redirectTo = '/dashboard' 
}) => {
  // If user is authenticated, redirect to the specified route (usually dashboard)
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // If user is not authenticated, render the public route (login, register, etc.)
  return <>{children}</>
}

export default PublicRoute
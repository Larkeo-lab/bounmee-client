import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import DefaultLayout from "@/layouts/DefaultLayout";
import { useAuth, checkTokenExpired } from "./AuthContext";
import { Role } from "@/types";

interface PrivateRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiresLayout?: boolean;
  allowedRoles?: Role[];
  permissionKey?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  redirectTo = "/",
  requiresLayout = true,
  allowedRoles: _allowedRoles,
  permissionKey: _permissionKey,
}) => {
  const { isAuthenticated, user: _user, logout, loading } = useAuth();

  // Check token expiration
  const isExpired = React.useMemo(() => {
    try {
      const userDataStr = localStorage.getItem("authPOS");
      if (!userDataStr) return true;

      const userData = JSON.parse(userDataStr);
      if (!userData?.accessToken) return true;

      return checkTokenExpired(userData.accessToken);
    } catch (error) {
      console.error("Token check failed:", error);
      return true;
    }
  }, []);

  useEffect(() => {
    // If token is expired, logout the user
    if (isExpired && isAuthenticated) {
      logout();
    }
  }, [isExpired, isAuthenticated, logout]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated or token is expired, redirect to login
  if (!isAuthenticated || isExpired) {
    return <Navigate to={redirectTo} replace />;
  }

  // Role-based access check (Temporarily disabled as requested)
  /*
  if (allowedRoles && user && !allowedRoles.includes(user.user?.role)) {
    // Attempt permission-based bypass for EMPLOYEE
    if (user.user?.role === "EMPLOYEE" && permissionKey && user.user?.employee?.permission?.permissions) {
      const perms = user.user.employee.permission.permissions;
      if (perms[permissionKey]?.includes("view")) {
        // Employee has specific permission, grant access!
        if (requiresLayout) {
          return <DefaultLayout>{children}</DefaultLayout>;
        }
        return <>{children}</>;
      }
    }
    // Block access completely, safely redirect back to a globally allowed page to avoid Infinite Loop
    return <Navigate to="/tables" replace />;
  }
  */

  // If user is authenticated and token is valid, render the private route
  if (requiresLayout) {
    return <DefaultLayout>{children}</DefaultLayout>;
  }

  return <>{children}</>;
};

export default PrivateRoute;

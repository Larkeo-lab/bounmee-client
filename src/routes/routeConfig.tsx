import React from "react";
import { RouteObject } from "react-router-dom";

// Import page components
import LoginPage from "@/pages/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import PageNotFound from "@/pages/PageNotFound";

// Import route components
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

export interface AppRoute {
  path: string;
  element: React.ReactNode;
  isPrivate: boolean;
  requiresLayout?: boolean;
}

// Define all application routes
export const appRoutes: AppRoute[] = [
  {
    path: "/",
    element: <LoginPage />,
    isPrivate: false,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    isPrivate: true,
    requiresLayout: true,
  },
  {
    path: "/*",
    element: <PageNotFound />,
    isPrivate: true,
    requiresLayout: false,
  },
];

// Generate React Router routes based on authentication status
export const generateRoutes = (
  isAuthenticated: boolean = false,
): RouteObject[] => {
  return appRoutes.map((route) => ({
    path: route.path,
    element: route.isPrivate ? (
      <PrivateRoute requiresLayout={route.requiresLayout}>
        {route.element}
      </PrivateRoute>
    ) : (
      <PublicRoute isAuthenticated={isAuthenticated}>
        {route.element}
      </PublicRoute>
    ),
  }));
};


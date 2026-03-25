import React from "react";
import { RouteObject } from "react-router-dom";

// Import page components
import LoginPage from "@/pages/Login";
import MainPage from "@/pages/main/MainPage";
import PageNotFound from "@/pages/PageNotFound";
import ProductPage from "@/pages/settings/product/ProductPage";
import CategoryPage from "@/pages/settings/category/CategoryPage";
import BankPage from "@/pages/settings/bank/BankPage";
import EmployeePage from "@/pages/settings/employee/EmployeePage";
import ProfilePage from "@/pages/settings/profile/ProfilePage";
import SettingsPage from "@/pages/settings/SettingsPage";
import OrderPage from "@/pages/order/OrderPage";

// Import route components
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "@/pages/dashboard/Dashboard";

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
    path: "/main",
    element: <MainPage />,
    isPrivate: true,
    requiresLayout: true,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    isPrivate: true,
    requiresLayout: true,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
    isPrivate: true,
    requiresLayout: true,
  },
  {
    path: "/settings/product",
    element: <ProductPage />,
    isPrivate: true,
    requiresLayout: true,
  },
  {
    path: "/settings/category",
    element: <CategoryPage />,
    isPrivate: true,
    requiresLayout: true,
  },
  {
    path: "/settings/bank",
    element: <BankPage />,
    isPrivate: true,
    requiresLayout: true,
  },
  {
    path: "/settings/employee",
    element: <EmployeePage />,
    isPrivate: true,
    requiresLayout: true,
  },
  {
    path: "/settings/profile",
    element: <ProfilePage />,
    isPrivate: true,
    requiresLayout: true,
  },
  {
    path: "/order",
    element: <OrderPage />,
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

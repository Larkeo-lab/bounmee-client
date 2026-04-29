import React from "react";
import { RouteObject } from "react-router-dom";

import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

import { Role } from "@/types";

// Import page components
import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";
import QuestionnairePage from "@/pages/questionnaire/QuestionnairePage";
import PageNotFound from "@/pages/PageNotFound";
import CustomerMenuPage from "@/pages/customer/CustomerMenuPage";
import ProductPage from "@/pages/settings/product/ProductPage";
import CategoryPage from "@/pages/settings/category/CategoryPage";
import BankPage from "@/pages/settings/bank/BankPage";
import EmployeePage from "@/pages/settings/employee/EmployeePage";
import ProfilePage from "@/pages/settings/profile/ProfilePage";
import SettingsPage from "@/pages/settings/SettingsPage";
import MoneyRatePage from "@/pages/settings/moneyRate/MoneyRatePage";
import OrderPage from "@/pages/order/OrderPage";
import PermissionSetting from "@/pages/settings/permission-management/PermissionSetting";
import AddRoleUser from "@/pages/settings/permission-management/AddRoleUser";

// Import route components

import Dashboard from "@/pages/dashboard/Dashboard";
import TablePage from "@/pages/table/TablePage";
import TableSettingsPage from "@/pages/settings/table/TableSettingsPage";
import OrderingPage from "@/pages/ordering/OrderingPage";
import KitchenPage from "@/pages/kitchen/KitchenPage";
import ChatPage from "@/pages/chat/ChatPage";
import ProductOrderPage from "@/pages/saleGeneral/ProductOrderPage";
import CafeOrderPage from "@/pages/saleCafe/ProductOrderPage";

export interface AppRoute {
  path: string;
  element: React.ReactNode;
  isPrivate: boolean;
  requiresLayout?: boolean;
  allowedRoles?: Role[];
  permissionKey?: string;
}

// Define all application routes
export const appRoutes: AppRoute[] = [
  {
    path: "/",
    element: <LoginPage />,
    isPrivate: false,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    isPrivate: false,
  },
  {
    path: "/questionnaire",
    element: <QuestionnairePage />,
    isPrivate: true,
    requiresLayout: false,
  },
  {
    path: "/menu/:qrCode",
    element: <CustomerMenuPage />,
    isPrivate: false,
  },
  {
    path: "/product-order",
    element: <ProductOrderPage />,
    isPrivate: true,
    requiresLayout: true,
  },
  {
    path: "/cafe-order",
    element: <CafeOrderPage />,
    isPrivate: true,
    requiresLayout: true,
    permissionKey: "cafe",
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    isPrivate: true,
    requiresLayout: true,
    allowedRoles: ["SUPER_ADMIN", "STORE_ADMIN"],
    permissionKey: "dashboard",
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
    path: "/settings/table",
    element: <TableSettingsPage />,
    isPrivate: true,
    requiresLayout: true,
    allowedRoles: ["SUPER_ADMIN", "STORE_ADMIN"],
    permissionKey: "table_settings",
  },
  {
    path: "/settings/bank",
    element: <BankPage />,
    isPrivate: true,
    requiresLayout: true,
    allowedRoles: ["SUPER_ADMIN", "STORE_ADMIN"],
    permissionKey: "bank",
  },
  {
    path: "/settings/employee",
    element: <EmployeePage />,
    isPrivate: true,
    requiresLayout: true,
    allowedRoles: ["SUPER_ADMIN", "STORE_ADMIN"],
    permissionKey: "employee",
  },
  {
    path: "/settings/money-rate",
    element: <MoneyRatePage />,
    isPrivate: true,
    requiresLayout: true,
    allowedRoles: ["SUPER_ADMIN", "STORE_ADMIN"],
    permissionKey: "moneyRate",
  },
  {
    path: "/settings/profile",
    element: <ProfilePage />,
    isPrivate: true,
    requiresLayout: true,
  },
  {
    path: "/permission-manage",
    element: <PermissionSetting />,
    isPrivate: true,
    requiresLayout: true,
    allowedRoles: ["SUPER_ADMIN", "STORE_ADMIN"],
    permissionKey: "employee",
  },
  {
    path: "/permission/add",
    element: <AddRoleUser />,
    isPrivate: true,
    requiresLayout: true,
    allowedRoles: ["SUPER_ADMIN", "STORE_ADMIN"],
    permissionKey: "employee",
  },
  {
    path: "/permission/add/:id",
    element: <AddRoleUser />,
    isPrivate: true,
    requiresLayout: true,
    allowedRoles: ["SUPER_ADMIN", "STORE_ADMIN"],
    permissionKey: "employee",
  },
  {
    path: "/order",
    element: <OrderPage />,
    isPrivate: true,
    requiresLayout: true,
  },
  {
    path: "/tables",
    element: <TablePage />,
    isPrivate: true,
    requiresLayout: true,
  },
  {
    path: "/ordering",
    element: <OrderingPage />,
    isPrivate: true,
    requiresLayout: true,
    permissionKey: "ordering",
  },
  {
    path: "/kitchen",
    element: <KitchenPage />,
    isPrivate: true,
    requiresLayout: true,
    permissionKey: "kitchen",
  },
  {
    path: "/chat",
    element: <ChatPage />,
    isPrivate: true,
    requiresLayout: true,
    permissionKey: "chat",
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
      <PrivateRoute
        allowedRoles={route.allowedRoles}
        permissionKey={route.permissionKey}
        requiresLayout={route.requiresLayout}
      >
        {route.element}
      </PrivateRoute>
    ) : (
      <PublicRoute isAuthenticated={isAuthenticated}>
        {route.element}
      </PublicRoute>
    ),
  }));
};

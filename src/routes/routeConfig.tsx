import React from "react";
import { RouteObject } from "react-router-dom";

import { Role } from "@/types";

// Import page components
import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";
import PageNotFound from "@/pages/PageNotFound";
import FirshPage from "@/pages/FirshPage";
import HomePage from "@/pages/home/Home";
import ReportPage from "@/pages/report/Report";
import ReportHistoryPage from "@/pages/report/ReportHistory";
import ReportProgressPage from "@/pages/report/ReportProgress";
import TrafficRulesPage from "@/pages/education/TrafficRules";
import LawEducationPage from "@/pages/education/LawEducation";
import ReportDetailPage from "@/pages/report/ReportDetail";
import NewsDetailPage from "@/pages/news/NewsDetail";
import ProfileEditPage from "@/pages/settings/ProfileEdit";
import ComingSoonPage from "@/pages/ComingSoon";
import PoliceHomePage from "@/pages/police/PoliceHome";
import PoliceDistrictVillagesPage from "@/pages/police/PoliceDistrictVillages";
import VillageReportPage from "@/pages/police/sections/policeDistrict/report";

// Prisma User.userType — the portal a logged-in user belongs to
export type UserType =
  | "POLICE_DEPARTMENT"
  | "DISTRICT_POLICE"
  | "VILLAGE_CHIEF"
  | "CITIZEN";

export interface AppRoute {
  path: string;
  element: React.ReactNode;
  isPrivate?: boolean;
  requiresLayout?: boolean;
  allowedRoles?: Role[];
  // Restrict a route to specific user types (empty/undefined = any logged-in user)
  allowedUserTypes?: UserType[];
  permissionKey?: string;
}

// Define all application routes
export const appRoutes: AppRoute[] = [
  {
    path: "/",
    element: <FirshPage />,
    isPrivate: false,
  },
  {
    path: "/home",
    element: <HomePage />,
    isPrivate: true,
    allowedUserTypes: ["CITIZEN"],
  },
  {
    path: "/report/create",
    element: <ReportPage />,
    isPrivate: true,
    allowedUserTypes: ["CITIZEN"],
  },
  {
    path: "/report/history",
    element: <ReportHistoryPage />,
    isPrivate: true,
    allowedUserTypes: ["CITIZEN"],
  },
  {
    path: "/report/progress",
    element: <ReportProgressPage />,
    isPrivate: true,
    allowedUserTypes: ["CITIZEN"],
  },
  {
    path: "/traffic-rules",
    element: <TrafficRulesPage />,
    isPrivate: true,
    allowedUserTypes: ["CITIZEN"],
  },
  {
    path: "/law-education",
    element: <LawEducationPage />,
    isPrivate: true,
    allowedUserTypes: ["CITIZEN"],
  },
  {
    path: "/report/:id",
    element: <ReportDetailPage />,
    isPrivate: true,
    allowedUserTypes: ["CITIZEN"],
  },
  {
    path: "/news/:id",
    element: <NewsDetailPage />,
    isPrivate: true,
    allowedUserTypes: ["CITIZEN"],
  },
  {
    path: "/settings/profile",
    element: <ProfileEditPage />,
    isPrivate: true,
    allowedUserTypes: ["CITIZEN"],
  },

  // Police portal — shared by all police roles (data differs per role)
  {
    path: "/police/home",
    element: <PoliceHomePage />,
    isPrivate: true,
    allowedUserTypes: ["POLICE_DEPARTMENT", "DISTRICT_POLICE", "VILLAGE_CHIEF"],
  },
  // Villages of a district's police office (opened from the police-district cards)
  {
    path: "/police/police-district/:districtId",
    element: <PoliceDistrictVillagesPage />,
    isPrivate: true,
    allowedUserTypes: ["POLICE_DEPARTMENT", "DISTRICT_POLICE"],
  },
  // All reports of a single village (opened from a village badge)
  {
    path: "/police/village/:villageId/reports",
    element: <VillageReportPage />,
    isPrivate: true,
    allowedUserTypes: ["POLICE_DEPARTMENT", "DISTRICT_POLICE"],
  },

  // Placeholder portal for roles not built yet
  {
    path: "/coming-soon",
    element: <ComingSoonPage />,
    isPrivate: true,
  },

  {
    path: "/login",
    element: <LoginPage />,
    isPrivate: false,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    isPrivate: false,
  },
  {
    path: "/*",
    element: <PageNotFound />,
    isPrivate: false,
    requiresLayout: false,
  },
];

// Generate React Router routes
export const generateRoutes = (
  _isAuthenticated: boolean = false,
): RouteObject[] => {
  return appRoutes.map((route) => ({
    path: route.path,
    element: route.element,
  }));
};


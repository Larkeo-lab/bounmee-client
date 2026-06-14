import { Navigate } from "react-router-dom";

import { useAuth } from "./AuthContext";
import type { AppRoute } from "./routeConfig";

// Enforces auth + user-type access for a single route.
export function RouteGuard({ route }: { route: AppRoute }) {
  const { isAuthenticated, user: authData } = useAuth();
  const userType = (authData as any)?.user?.userType as string | undefined;

  // Private route, not logged in → go log in
  if (route.isPrivate && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Route restricted to specific user types
  if (route.allowedUserTypes && route.allowedUserTypes.length > 0) {
    if (!isAuthenticated || !userType) {
      return <Navigate to="/login" replace />;
    }
    if (!route.allowedUserTypes.includes(userType as never)) {
      // Logged in but wrong portal → safe placeholder (no redirect loop)
      return <Navigate to="/coming-soon" replace />;
    }
  }

  return <>{route.element}</>;
}

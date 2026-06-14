import { Routes, Route } from "react-router-dom";

import { appRoutes, useAuth } from "@/routes";
import { RouteGuard } from "@/routes/RouteGuard";

function App() {
  const { loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {appRoutes.map((route, index) => (
        <Route
          key={index}
          element={<RouteGuard route={route} />}
          path={route.path}
        />
      ))}
    </Routes>
  );
}

export default App;

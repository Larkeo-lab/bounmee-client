import { Routes, Route } from "react-router-dom";

import { generateRoutes, useAuth } from "@/routes";

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const routes = generateRoutes(isAuthenticated);

  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} element={route.element} path={route.path} />
      ))}
    </Routes>
  );
}

export default App;

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import RefreshHandler from "./RefreshHandler";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);
  
  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    // Wrap the entire app in GoogleOAuthProvider
    <GoogleOAuthProvider clientId="889292981742-rplblsl1opsnklj0465vupmm17d7h76p.apps.googleusercontent.com">
      <div>
        <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={<PrivateRoute element={<Dashboard />} />}
          />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;

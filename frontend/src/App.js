import { GoogleOAuthProvider } from "@react-oauth/google";
import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import RefreshHandler from "./RefreshHandler";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

<<<<<<< HEAD
=======
  // Check localStorage for token on page load
>>>>>>> 9326144 (error solve and frontend by darshan)
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);
<<<<<<< HEAD
  
=======

  // Private route logic
>>>>>>> 9326144 (error solve and frontend by darshan)
  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <GoogleOAuthProvider clientId="889292981742-ucknqtugi62s3em7r185in1prat5revr.apps.googleusercontent.com">
      <div>
        <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;

import { Routes,Route,Navigate } from "react-router-dom";
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Login from "./pages/Login";
import { useState } from "react";
import RefreshHandler from "./RefreshHandler";
function App() {
  const [isAuthenticated , setIsAuthenticated] = useState(false);
  const PrivatRoute = ({element}) => {
    return  isAuthenticated ? element : <Navigate to='/login'/>
  }
  return (
    <div>
        <RefreshHandler setIsAuthenticated={setIsAuthenticated}/>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/dashboard" element={<PrivatRoute element={<Dashboard/>} />} /> 
      </Routes>
    </div>
  );
}

export default App;

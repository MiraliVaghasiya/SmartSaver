import { Routes,Route,Navigate } from "react-router-dom";
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Login from "./pages/Login";

function App() {
  return (
    <div  >
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/dashboard" element={<Dashboard />} /> 
      </Routes>
    </div>
  );
}

export default App;

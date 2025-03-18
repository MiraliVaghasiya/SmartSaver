import React, { useEffect, useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import { handleSuccess } from '../utils';
import { ToastContainer } from 'react-toastify';
function Dashboard() {
  
  const [loggedInUser, setLoggedInUser] = useState('');

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (user) {
      setLoggedInUser(JSON.parse(user)); // Convert string to object
    }
  }, []);

  const navigate  = useNavigate();
  const handleLogout = (e)=>{
    localStorage.removeItem('token')
    localStorage.removeItem('loggedInUser')
    handleSuccess("User Loggedout")
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  }

  console.log(loggedInUser);
  
  return (
    <div>
      <h1>{loggedInUser?.name}</h1>
      <button onClick={handleLogout }>Logout</button>
      <ToastContainer/>
    </div>
  );
}

export default Dashboard; 
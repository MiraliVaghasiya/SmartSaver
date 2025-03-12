import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from '../utils';
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError('email, and password are required');
    }

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginInfo)
      });

      const result = await response.json();
      if (result.success) {
        handleSuccess(result.message);
        localStorage.setItem('token' , result.jwtToken)
        localStorage.setItem('loggedInUser' , result.name)
        setTimeout(() => navigate('/Dashboard'), 1000);
      } else {
        const errorMessage = result.error?.details[0]?.message || result.message;
        handleError(errorMessage);
      }

    } catch (err) {
      handleError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email :</label>
          <input type="email" name="email" placeholder="Enter your email..." onChange={handleChange} value={loginInfo.email} />
        </div>
        <div>
          <label>Password :</label>
          <input type="password" name="password" placeholder="Enter your password..." onChange={handleChange} value={loginInfo.password} />
        </div>
        <button type="submit">Login</button>
        <span>Don't have an account? <Link to="/signup">Signup</Link></span>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Login;

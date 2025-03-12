import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from '../utils';
import "react-toastify/dist/ReactToastify.css";

function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false); // ✅ Loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const { name, email, password } = signupInfo;
    if (!name || !email || !password) {
      return handleError('Name, email, and password are required');
    }

    setLoading(true); // ✅ Show loading state

    try {
      const response = await fetch("http://localhost:8080/auth/signup", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupInfo)
      });

      const result = await response.json();
      setLoading(false); // ✅ Hide loading state

      if (result.success) {
        handleSuccess(result.message);

        // ✅ Store token and login user automatically
        localStorage.setItem("token", result.jwtToken);
        localStorage.setItem("loggedInUser", result.name);

        setTimeout(() => navigate('/dashboard'), 1000); // ✅ Redirect to dashboard
      } else {
        const errorMessage = result.error?.details[0]?.message || result.message;
        handleError(errorMessage);
      }
    } catch (err) {
      setLoading(false);
      handleError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="container">
      <h1>Signup</h1>
      <form onSubmit={handleSignup}>
        <div>
          <label>Name :</label>
          <input type="text" name="name" autoFocus placeholder="Enter your name..." onChange={handleChange} value={signupInfo.name} />
        </div>
        <div>
          <label>Email :</label>
          <input type="email" name="email" placeholder="Enter your email..." onChange={handleChange} value={signupInfo.email} />
        </div>
        <div>
          <label>Password :</label>
          <input type="password" name="password" placeholder="Enter your password..." onChange={handleChange} value={signupInfo.password} />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Signing Up..." : "Signup"}
        </button>
        <span>Already have an account? <Link to="/login">Login</Link></span>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Signup;

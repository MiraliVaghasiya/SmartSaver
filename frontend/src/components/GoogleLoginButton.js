import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { handleError } from "../utils";

const GoogleLoginButton = () => {
  const handleSuccessResponse = (response) => {
    fetch("http://localhost:8080/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: response.credential })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem("token", data.jwtToken);
        localStorage.setItem("loggedInUser", data.name);
        window.location.href = "/dashboard";
      } else {
        handleError(data.message);
      }
    })
    .catch(err => handleError("Google authentication failed"));
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccessResponse}
      onError={() => handleError("Google login failed")}
    />
  );
};

export default GoogleLoginButton;

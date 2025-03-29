import React, { useState, useEffect } from "react";
import WaterAnalysis from "../components/WaterAnalysis";
import ElectricityAnalysis from "../components/ElectricityAnalysis";
import { ToastContainer } from "react-toastify";
import "../components/style/Dashboard.css";
import { Line, Bar, Scatter } from "react-chartjs-2";

const Dashboard = () => {
  const [waterData, setWaterData] = useState(null);
  const [electricityData, setElectricityData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleFilePathChange = (filePath) => {
    setSelectedFilePath(filePath);
    localStorage.setItem("electricityFilePath", filePath);
  };

  return (
    <div className="dashboard-container">
      <header className="header_dashboard">
        <div className="header-container">
          <h1 className="header-text">Welcome to Dashboard</h1>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <div className="option-container">
        <button
          className="option-button"
          onClick={() => handleOptionChange("water")}
        >
          Water
        </button>
        <button
          className="option-button"
          onClick={() => handleOptionChange("electricity")}
        >
          Electricity
        </button>
      </div>
      {selectedOption === "water" && (
        <WaterAnalysis setWaterData={setWaterData} />
      )}
      {selectedOption === "electricity" && (
        <ElectricityAnalysis
          setElectricityData={setElectricityData}
          handleFilePathChange={handleFilePathChange}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default Dashboard;

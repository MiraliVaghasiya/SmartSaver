import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar, Scatter } from "react-chartjs-2";
import * as XLSX from "xlsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WaterAnalysis = ({ setWaterData }) => {
  const [file, setFile] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [drinkingData, setDrinkingData] = useState(null);
  const [cookingData, setCookingData] = useState(null);
  const [bathingData, setBathingData] = useState(null);
  const [washingClothesData, setWashingClothesData] = useState(null);
  const [dishwashingData, setDishwashingData] = useState(null);
  const [waterConsumptionByActivityData, setWaterConsumptionByActivityData] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };


  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    console.log("Uploading file:", file.name);
    const formData = new FormData();
    formData.append("dataset", file);

    try {
      const response = await axios.post("http://localhost:8080/dataset/upload/water", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload response:", response.data);

      if (response.data.success) {
        const jsonData = response.data.usagePerDay;
        console.log("Received Data Structure:", jsonData);
        if (!jsonData || Object.keys(jsonData).length === 0) {
          alert("No valid data received. Check the file format.");
          return;
        }
        const labels = Object.keys(jsonData);
        const waterUsage = labels.map((day) => jsonData[day].waterUsage);
        const drinking = labels.map((day) => jsonData[day].drinking);
        const cooking = labels.map((day) => jsonData[day].cooking);
        const bathing = labels.map((day) => jsonData[day].bathing);
        const washingClothes = labels.map((day) => jsonData[day].washingClothes);
        const dishwashing = labels.map((day) => jsonData[day].dishwashing);
        const waterConsumptionByActivity = labels.map((day) => jsonData[day].waterConsumptionByActivity);

        setChartData({
          labels,
          datasets: [
            {
              label: "Water Usage (Liters)",
              data: waterUsage,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        });

        setDrinkingData({
          labels,
          datasets: [
            {
              label: "Drinking (Liters)",
              data: drinking,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        });

        setCookingData({
          labels,
          datasets: [
            {
              label: "Cooking (Liters)",
              data: cooking,
              backgroundColor: "rgba(255, 206, 86, 0.2)",
              borderColor: "rgba(255, 206, 86, 1)",
              borderWidth: 1,
            },
          ],
        });

        setBathingData({
          labels,
          datasets: [
            {
              label: "Bathing (Liters)",
              data: bathing,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });

        setWashingClothesData({
          labels,
          datasets: [
            {
              label: "Washing Clothes (Liters)",
              data: washingClothes,
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
          ],
        });

        setDishwashingData({
          labels,
          datasets: [
            {
              label: "Dishwashing (Liters)",
              data: dishwashing,
              backgroundColor: "rgba(255, 159, 64, 0.2)",
              borderColor: "rgba(255, 159, 64, 1)",
              borderWidth: 1,
            },
          ],
        });

        setWaterConsumptionByActivityData({
          labels: ["Drinking", "Cooking", "Bathing", "Washing Clothes", "Dishwashing"],
          datasets: [
            {
              label: "Water Consumption by Activity",
              data: [drinking.reduce((a, b) => a + b, 0), cooking.reduce((a, b) => a + b, 0), bathing.reduce((a, b) => a + b, 0), washingClothes.reduce((a, b) => a + b, 0), dishwashing.reduce((a, b) => a + b, 0)],
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
              ],
              borderWidth: 1,
            },
          ],
        });

        setWaterData({
          labels,
          datasets: [
            {
              label: "Water Usage (Liters)",
              data: waterUsage,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        });
      } else {
        throw new Error("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading.");
    }
  };
  return (
    <div style={{ padding: "20px" }}>
      <h1>Water Analysis</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload & Analyze</button>
      {chartData && (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <div style={{ width: "50%", padding: "20px" }}>
            <h3>Water Usage Analysis</h3>
            <p>This graph shows the total water usage over time.</p>
            <Bar key={JSON.stringify(chartData)} data={chartData} />
          </div>
          <div style={{ width: "50%", padding: "20px" }}>
            <h3>Drinking Water Analysis</h3>
            <p>This graph shows the amount of water used for drinking over time.</p>
            <Bar key={JSON.stringify(drinkingData)} data={drinkingData} />
          </div>
          <div style={{ width: "50%", padding: "20px" }}>
            <h3>Cooking Water Analysis</h3>
            <p>This graph shows the amount of water used for cooking over time.</p>
            <Bar key={JSON.stringify(cookingData)} data={cookingData} />
          </div>
          <div style={{ width: "50%", padding: "20px" }}>
            <h3>Bathing Water Analysis</h3>
            <p>This graph shows the amount of water used for bathing over time.</p>
            <Bar key={JSON.stringify(bathingData)} data={bathingData} />
          </div>
          <div style={{ width: "50%", padding: "20px" }}>
            <h3>Washing Clothes Water Analysis</h3>
            <p>This graph shows the amount of water used for washing clothes over time.</p>
            <Bar key={JSON.stringify(washingClothesData)} data={washingClothesData} />
          </div>
          <div style={{ width: "50%", padding: "20px" }}>
            <h3>Dishwashing Water Analysis</h3>
            <p>This graph shows the amount of water used for dishwashing over time.</p>
            <Bar key={JSON.stringify(dishwashingData)} data={dishwashingData} />
          </div>
          <div style={{ width: "100%", padding: "20px" }}>
            <h3>Water Consumption by Activity</h3>
            <p>This graph shows the total amount of water used for each activity.</p>
            <Bar key={JSON.stringify(waterConsumptionByActivityData)} data={waterConsumptionByActivityData} />
          </div>
          <div style={{ width: "100%", padding: "20px" }}>
            <h3>Summary</h3>
            {chartData && (
              <div>
                <p>Total water usage: {chartData.datasets[0].data.reduce((a, b) => a + b, 0)} liters</p>
                <p>Average water usage per day: {chartData.datasets[0].data.reduce((a, b) => a + b, 0) / chartData.labels.length} liters</p>
                <p>Peak water usage day: {chartData.labels[chartData.datasets[0].data.indexOf(Math.max(...chartData.datasets[0].data))]}</p>
                {drinkingData && (
                  <p>Most water usage for drinking: {drinkingData.datasets[0].data.reduce((a, b) => a + b, 0)} liters</p>
                )}
                {cookingData && (
                  <p>Most water usage for cooking: {cookingData.datasets[0].data.reduce((a, b) => a + b, 0)} liters</p>
                )}
                {bathingData && (
                  <p>Most water usage for bathing: {bathingData.datasets[0].data.reduce((a, b) => a + b, 0)} liters</p>
                )}
                {washingClothesData && (
                  <p>Most water usage for washing clothes: {washingClothesData.datasets[0].data.reduce((a, b) => a + b, 0)} liters</p>
                )}
                {dishwashingData && (
                  <p>Most water usage for dishwashing: {dishwashingData.datasets[0].data.reduce((a, b) => a + b, 0)} liters</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
  
};

export default WaterAnalysis;

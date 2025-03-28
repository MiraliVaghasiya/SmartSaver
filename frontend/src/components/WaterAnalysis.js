import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Line,
  Bar,
  Scatter,
  Pie,
  Radar,
  PolarArea,
  Doughnut,
} from "react-chartjs-2";
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
  ArcElement,
  RadialLinearScale,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const WaterAnalysis = ({ setWaterData }) => {
  const [file, setFile] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [drinkingData, setDrinkingData] = useState(null);
  const [cookingData, setCookingData] = useState(null);
  const [bathingData, setBathingData] = useState(null);
  const [washingClothesData, setWashingClothesData] = useState(null);
  const [dishwashingData, setDishwashingData] = useState(null);
  const [waterConsumptionByActivityData, setWaterConsumptionByActivityData] =
    useState(null);
  const [summaryData, setSummaryData] = useState(null);

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
      const response = await axios.post(
        "http://localhost:8080/dataset/upload/water",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
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
        const washingClothes = labels.map(
          (day) => jsonData[day].washingClothes
        );
        const dishwashing = labels.map((day) => jsonData[day].dishwashing);
        const waterConsumptionByActivity = labels.map(
          (day) => jsonData[day].waterConsumptionByActivity
        );

        setChartData({
          labels,
          datasets: [
            {
              label: "Water Usage (Liters)",
              data: waterUsage,
              backgroundColor: "rgba(255, 99, 132, 0.2)", // red
              borderColor: "rgba(255, 99, 132, 1)", // red
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
              backgroundColor: "rgba(54, 162, 235, 0.2)", // blue
              borderColor: "rgba(54, 162, 235, 1)", // blue
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
              backgroundColor: "rgba(255, 206, 86, 0.2)", // yellow
              borderColor: "rgba(255, 206, 86, 1)", // yellow
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
              backgroundColor: "rgba(75, 192, 192, 0.2)", // green
              borderColor: "rgba(75, 192, 192, 1)", // green
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
              backgroundColor: "rgba(153, 102, 255, 0.2)", // purple
              borderColor: "rgba(153, 102, 255, 1)", // purple
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
              backgroundColor: "rgba(255, 159, 64, 0.2)", // orange
              borderColor: "rgba(255, 159, 64, 1)", // orange
              borderWidth: 1,
            },
          ],
        });

        setWaterConsumptionByActivityData({
          labels: [
            "Drinking",
            "Cooking",
            "Bathing",
            "Washing Clothes",
            "Dishwashing",
          ],
          datasets: [
            {
              label: "Water Consumption by Activity",
              data: [
                drinking.reduce((a, b) => a + b, 0),
                cooking.reduce((a, b) => a + b, 0),
                bathing.reduce((a, b) => a + b, 0),
                washingClothes.reduce((a, b) => a + b, 0),
                dishwashing.reduce((a, b) => a + b, 0),
              ],
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)", // red
                "rgba(54, 162, 235, 0.2)", // blue
                "rgba(255, 206, 86, 0.2)", // yellow
                "rgba(75, 192, 192, 0.2)", // green
                "rgba(153, 102, 255, 0.2)", // purple
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)", // red
                "rgba(54, 162, 235, 1)", // blue
                "rgba(255, 206, 86, 1)", // yellow
                "rgba(75, 192, 192, 1)", // green
                "rgba(153, 102, 255, 1)", // purple
              ],
              borderWidth: 1,
            },
          ],
        });

        setSummaryData({
          totalWaterUsage: waterUsage.reduce((a, b) => a + b, 0),
          averageWaterUsage:
            waterUsage.reduce((a, b) => a + b, 0) / labels.length,
          peakWaterUsageDay:
            labels[waterUsage.indexOf(Math.max(...waterUsage))],
          mostWaterUsageForDrinking: drinking.reduce((a, b) => a + b, 0),
          mostWaterUsageForCooking: cooking.reduce((a, b) => a + b, 0),
          mostWaterUsageForBathing: bathing.reduce((a, b) => a + b, 0),
          mostWaterUsageForWashingClothes: washingClothes.reduce(
            (a, b) => a + b,
            0
          ),
          mostWaterUsageForDishwashing: dishwashing.reduce((a, b) => a + b, 0),
        });

        setWaterData({
          labels,
          datasets: [
            {
              label: "Water Usage (Liters)",
              data: waterUsage,
              backgroundColor: "rgba(255, 99, 132, 0.2)", // red
              borderColor: "rgba(255, 99, 132, 1)", // red
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

  const getGraphType = (data) => {
    const max = Math.max(...data.datasets[0].data);
    const min = Math.min(...data.datasets[0].data);
    const range = max - min;

    if (range > 100) {
      return "Bar";
    } else if (range > 10) {
      return "Line";
    } else {
      return "Scatter";
    }
  };

  return (
    <div className="water-analysis-container">
      <h1>Water Analysis</h1>
      <div class="btn-dflex">
        <input type="file" class="file-uplod" onChange={handleFileChange} />
        <button className="file-upload-button" onClick={handleUpload}>
          Upload & Analyze
        </button>
      </div>
      {chartData && (
        <div className="water-analysis-graph">
          <div className="first-row" style={{ display: "flex" }}>
            <div style={{ width: "50%" }}>
              <div className="inner-row">
                <h3>Water Usage Analysis</h3>
                <p>This graph shows the total water usage over time.</p>
                {getGraphType(chartData) === "Bar" ? (
                  <Bar
                    key={JSON.stringify(chartData)}
                    data={chartData}
                    options={{
                      fill: true,
                      theme: "dark",
                    }}
                  />
                ) : getGraphType(chartData) === "Line" ? (
                  <Line
                    key={JSON.stringify(chartData)}
                    data={chartData}
                    options={{
                      fill: true,
                      theme: "dark", // or "light"
                    }}
                  />
                ) : (
                  <Scatter
                    key={JSON.stringify(chartData)}
                    data={chartData}
                    options={{
                      fill: true,
                      theme: "dark", // or "light"
                    }}
                  />
                )}
              </div>
            </div>
            <div style={{ width: "50%" }}>
              <div className="inner-row">
                <h3>Water Consumption by Activity</h3>
                <p>
                  This graph shows the total amount of water used for each
                  activity.
                </p>
                <div className="pie-chart-container">
                  <Doughnut
                    key={JSON.stringify(waterConsumptionByActivityData)}
                    data={waterConsumptionByActivityData}
                    options={{
                      title: {
                        display: true,
                        text: "Water Consumption by Activity",
                      },
                      legend: {
                        display: true,
                        position: "bottom",
                      },
                      aspectRatio: 1,
                      maintainAspectRatio: false,
                      theme: "dark", // or "light"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="second-row" style={{ display: "flex" }}>
            <div style={{ width: "50%" }}>
              <div className="inner-row">
                <h3>Drinking Water Analysis</h3>
                <p>
                  This graph shows the amount of water used for drinking over
                  time.
                </p>
                {getGraphType(drinkingData) === "Bar" ? (
                  <Bar key={JSON.stringify(drinkingData)} data={drinkingData} />
                ) : getGraphType(drinkingData) === "Line" ? (
                  <Line
                    key={JSON.stringify(drinkingData)}
                    data={drinkingData}
                  />
                ) : (
                  <Scatter
                    key={JSON.stringify(drinkingData)}
                    data={drinkingData}
                  />
                )}
              </div>
            </div>
            <div style={{ width: "50%" }}>
              <div className="inner-row">
                <h3>Cooking Water Analysis</h3>
                <p>
                  This graph shows the amount of water used for cooking over
                  time.
                </p>
                {getGraphType(cookingData) === "Bar" ? (
                  <Bar key={JSON.stringify(cookingData)} data={cookingData} />
                ) : getGraphType(cookingData) === "Line" ? (
                  <Line key={JSON.stringify(cookingData)} data={cookingData} />
                ) : (
                  <Scatter
                    key={JSON.stringify(cookingData)}
                    data={cookingData}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="third-row" style={{ display: "flex" }}>
            <div style={{ width: "50%" }}>
              <div className="inner-row">
                <h3>Bathing Water Analysis</h3>
                <p>
                  This graph shows the amount of water used for bathing over
                  time.
                </p>
                {getGraphType(bathingData) === "Bar" ? (
                  <Bar key={JSON.stringify(bathingData)} data={bathingData} />
                ) : getGraphType(bathingData) === "Line" ? (
                  <Line key={JSON.stringify(bathingData)} data={bathingData} />
                ) : (
                  <Scatter
                    key={JSON.stringify(bathingData)}
                    data={bathingData}
                  />
                )}
              </div>
            </div>
            <div style={{ width: "50%" }}>
              <div className="inner-row">
                <h3>Washing Clothes Water Analysis</h3>
                <p>
                  This graph shows the amount of water used for washing clothes
                  over time.
                </p>
                {getGraphType(washingClothesData) === "Bar" ? (
                  <Bar
                    key={JSON.stringify(washingClothesData)}
                    data={washingClothesData}
                  />
                ) : getGraphType(washingClothesData) === "Line" ? (
                  <Line
                    key={JSON.stringify(washingClothesData)}
                    data={washingClothesData}
                  />
                ) : (
                  <Scatter
                    key={JSON.stringify(washingClothesData)}
                    data={washingClothesData}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="fourth-row" style={{ display: "flex" }}>
            <div style={{ width: "50%" }}>
              <div className="inner-row">
                <h3>Dishwashing Water Analysis</h3>
                <p>
                  This graph shows the amount of water used for dishwashing over
                  time.
                </p>
                {getGraphType(dishwashingData) === "Bar" ? (
                  <Bar
                    key={JSON.stringify(dishwashingData)}
                    data={dishwashingData}
                  />
                ) : getGraphType(dishwashingData) === "Line" ? (
                  <Line
                    key={JSON.stringify(dishwashingData)}
                    data={dishwashingData}
                  />
                ) : (
                  <Scatter
                    key={JSON.stringify(dishwashingData)}
                    data={dishwashingData}
                  />
                )}
              </div>
            </div>
            <div style={{ width: "50%" }}>
              <div className="inner-row">
                <h3>Summary</h3>
                {summaryData && (
                  <div>
                    <p>
                      Total water usage: {summaryData.totalWaterUsage} liters
                    </p>
                    <p>
                      Average water usage per day:{" "}
                      {summaryData.averageWaterUsage} liters
                    </p>
                    <p>Peak water usage day: {summaryData.peakWaterUsageDay}</p>
                    <p>
                      Most water usage for drinking:{" "}
                      {summaryData.mostWaterUsageForDrinking} liters
                    </p>
                    <p>
                      Most water usage for cooking:{" "}
                      {summaryData.mostWaterUsageForCooking} liters
                    </p>
                    <p>
                      Most water usage for bathing:{" "}
                      {summaryData.mostWaterUsageForBathing} liters
                    </p>
                    <p>
                      Most water usage for washing clothes:{" "}
                      {summaryData.mostWaterUsageForWashingClothes} liters
                    </p>
                    <p>
                      Most water usage for dishwashing:{" "}
                      {summaryData.mostWaterUsageForDishwashing} liters
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterAnalysis;

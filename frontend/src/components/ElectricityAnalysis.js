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

const ElectricityAnalysis = ({ setElectricityData, handleFilePathChange }) => {
  const [file, setFile] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [timestampData, setTimestampData] = useState(null);
  const [totalElectricityData, setTotalElectricityData] = useState(null);
  const [fanData, setFanData] = useState(null);
  const [refrigeratorData, setRefrigeratorData] = useState(null);
  const [washingMachineData, setWashingMachineData] = useState(null);
  const [heaterData, setHeaterData] = useState(null);
  const [lightsData, setLightsData] = useState(null);
  const [analysis, setAnalysis] = useState(null);

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
      const response = await axios.post("http://localhost:8080/dataset/upload/electricity", formData, {
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
        const timestamp = labels.map((day) => new Date(jsonData[day].timestamp).toLocaleString());
        const totalElectricity = labels.map((day) => jsonData[day].electricityUsage);
        const fan = labels.map((day) => jsonData[day].fan);
        const refrigerator = labels.map((day) => jsonData[day].refrigerator);
        const washingMachine = labels.map((day) => jsonData[day].washingMachine);
        const heater = labels.map((day) => jsonData[day].heater);
        const lights = labels.map((day) => jsonData[day].lights);

        setChartData({
          labels,
          datasets: [
            {
              label: "Electricity Usage (kWh)",
              data: totalElectricity,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        });

        setTimestampData({
          labels,
          datasets: [
            {
              label: "Timestamp",
              data: timestamp,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        });

        setTotalElectricityData({
          labels,
          datasets: [
            {
              label: "Total Electricity (kWh)",
              data: totalElectricity,
              backgroundColor: "rgba(255, 206, 86, 0.2)",
              borderColor: "rgba(255, 206, 86, 1)",
              borderWidth: 1,
            },
          ],
        });

        setFanData({
          labels,
          datasets: [
            {
              label: "Fan (kWh)",
              data: fan,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });

        setRefrigeratorData({
          labels,
          datasets: [
            {
              label: "Refrigerator (kWh)",
              data: refrigerator,
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
          ],
        });

        setWashingMachineData({
          labels,
          datasets: [
            {
              label: "Washing Machine (kWh)",
              data: washingMachine,
              backgroundColor: "rgba(255, 159, 64, 0.2)",
              borderColor: "rgba(255, 159, 64, 1)",
              borderWidth: 1,
            },
          ],
        });

        setHeaterData({
          labels,
          datasets: [
            {
              label: "Heater (kWh)",
              data: heater,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        });

        setLightsData({
          labels,
          datasets: [
            {
              label: "Lights (kWh)",
              data: lights,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        });

        const maxElectricityUsage = Math.max(...totalElectricity);
        const maxElectricityUsageIndex = totalElectricity.indexOf(maxElectricityUsage);
        const maxElectricityUsageDate = labels[maxElectricityUsageIndex];

        const maxFanUsage = Math.max(...fan);
        const maxFanUsageIndex = fan.indexOf(maxFanUsage);
        const maxFanUsageDate = labels[maxFanUsageIndex];

        const maxRefrigeratorUsage = Math.max(...refrigerator);
        const maxRefrigeratorUsageIndex = refrigerator.indexOf(maxRefrigeratorUsage);
        const maxRefrigeratorUsageDate = labels[maxRefrigeratorUsageIndex];

        const maxWashingMachineUsage = Math.max(...washingMachine);
        const maxWashingMachineUsageIndex = washingMachine.indexOf(maxWashingMachineUsage);
        const maxWashingMachineUsageDate = labels[maxWashingMachineUsageIndex];

        const maxHeaterUsage = Math.max(...heater);
        const maxHeaterUsageIndex = heater.indexOf(maxHeaterUsage);
        const maxHeaterUsageDate = labels[maxHeaterUsageIndex];

        const maxLightsUsage = Math.max(...lights);
        const maxLightsUsageIndex = lights.indexOf(maxLightsUsage);
        const maxLightsUsageDate = labels[maxLightsUsageIndex];

        const averageElectricityUsage = totalElectricity.reduce((a, b) => a + b, 0) / totalElectricity.length;
        const averageFanUsage = fan.reduce((a, b) => a + b, 0) / fan.length;
        const averageRefrigeratorUsage = refrigerator.reduce((a, b) => a + b, 0) / refrigerator.length;
        const averageWashingMachineUsage = washingMachine.reduce((a, b) => a + b, 0) / washingMachine.length;
        const averageHeaterUsage = heater.reduce((a, b) => a + b, 0) / heater.length;
        const averageLightsUsage = lights.reduce((a, b) => a + b, 0) / lights.length;

        const totalElectricityConsumption = totalElectricity.reduce((a, b) => a + b, 0);
        const totalFanConsumption = fan.reduce((a, b) => a + b, 0);
        const totalRefrigeratorConsumption = refrigerator.reduce((a, b) => a + b, 0);
        const totalWashingMachineConsumption = washingMachine.reduce((a, b) => a + b, 0);
        const totalHeaterConsumption = heater.reduce((a, b) => a + b, 0);
        const totalLightsConsumption = lights.reduce((a, b) => a + b, 0);

        setAnalysis({
          maxElectricityUsage: `Consumed the most electricity : ${maxElectricityUsageDate} Total : ${maxElectricityUsage} kWh.`,
          maxFanUsage: `Used the fan the most : ${maxFanUsageDate} Total : ${maxFanUsage} kWh.`,
          maxRefrigeratorUsage: `Used the refrigerator the most : ${maxRefrigeratorUsageDate} Total : ${maxRefrigeratorUsage} kWh.`,
          maxWashingMachineUsage: `Used the washing machine the most : ${maxWashingMachineUsageDate} Total : ${maxWashingMachineUsage} kWh.`,
          maxHeaterUsage: `Used the heater the most : ${maxHeaterUsageDate} Total : ${maxHeaterUsage} kWh.`,
          maxLightsUsage: `Used the lights the most : ${maxLightsUsageDate} Total : ${maxLightsUsage} kWh.`,
          averageElectricityUsage: `Average electricity usage : ${averageElectricityUsage} kWh.`,
          averageFanUsage: `Average fan usage : ${averageFanUsage} kWh.`,
          averageRefrigeratorUsage: `Average refrigerator usage : ${averageRefrigeratorUsage} kWh.`,
          averageWashingMachineUsage: `Average washing machine usage : ${averageWashingMachineUsage} kWh.`,
          averageHeaterUsage: `Average heater usage : ${averageHeaterUsage} kWh.`,
          averageLightsUsage: `Average lights usage : ${averageLightsUsage} kWh.`,
          totalElectricityConsumption: `Total electricity consumption : ${totalElectricityConsumption} kWh.`,
          totalFanConsumption: `Total fan consumption : ${totalFanConsumption} kWh.`,
          totalRefrigeratorConsumption: `Total refrigerator consumption : ${totalRefrigeratorConsumption} kWh.`,
          totalWashingMachineConsumption: `Total washing machine consumption : ${totalWashingMachineConsumption} kWh.`,
          totalHeaterConsumption: `Total heater consumption : ${totalHeaterConsumption} kWh.`,
          totalLightsConsumption: `Total lights consumption : ${totalLightsConsumption} kWh.`,
        });

        setElectricityData({
          labels,
          datasets: [
            {
              label: "Electricity Usage (kWh)",
              data: totalElectricity,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        });

        handleFilePathChange(file.name);
      } else {
        throw new Error("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading.");
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Electricity Analysis</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload & Analyze</button>
      {chartData && (
        <div className="graph-row">
          <div className="graph-container">
            <h2>Electricity Usage Analysis</h2>
            <p>This graph shows the total electricity usage over time.</p>
            <Bar key={JSON.stringify(chartData)} data={chartData} />
          </div>
          <div className="graph-container">
            <h2>Timestamp Analysis</h2>
            <p>This graph shows the timestamp of each data point.</p>
            <Line key={JSON.stringify(timestampData)} data={timestampData} />
          </div>
        </div>
      )}
      {totalElectricityData && (
        <div className="graph-row">
          <div className="graph-container">
            <h2>Total Electricity Analysis</h2>
            <p>This graph shows the total electricity usage over time.</p>
            <Bar key={JSON.stringify(totalElectricityData)} data={totalElectricityData} />
          </div>
          <div className="graph-container">
            <h2>Fan Analysis</h2>
            <p>This graph shows the electricity usage of the fan over time.</p>
            <Bar key={JSON.stringify(fanData)} data={fanData} />
          </div>
        </div>
      )}
      {refrigeratorData && (
        <div className="graph-row">
          <div className="graph-container">
            <h2>Refrigerator Analysis</h2>
            <p>This graph shows the electricity usage of the refrigerator over time.</p>
            <Bar key={JSON.stringify(refrigeratorData)} data={refrigeratorData} />
          </div>
          <div className="graph-container">
            <h2>Washing Machine Analysis</h2>
            <p>This graph shows the electricity usage of the washing machine over time.</p>
            <Bar key={JSON.stringify(washingMachineData)} data={washingMachineData} />
          </div>
        </div>
      )}
      {heaterData && (
        <div className="graph-row">
          <div className="graph-container">
            <h2>Heater Analysis</h2>
            <p>This graph shows the electricity usage of the heater over time.</p>
            <Bar key={JSON.stringify(heaterData)} data={heaterData} />
          </div>
          <div className="graph-container">
            <h2>Lights Analysis</h2>
            <p>This graph shows the electricity usage of the lights over time.</p>
            <Bar key={JSON.stringify(lightsData)} data={lightsData} />
          </div>
        </div>
      )}
      {analysis && (
        <div className="analysis-box">
          <h2>Analysis</h2>
          <div className="analysis-card">
            <h3>Max Electricity Usage</h3>
            <p>{analysis.maxElectricityUsage}</p>
          </div>
          <div className="analysis-card">
            <h3>Max Fan Usage</h3>
            <p>{analysis.maxFanUsage}</p>
          </div>
          <div className="analysis-card">
            <h3>Max Refrigerator Usage</h3>
            <p>{analysis.maxRefrigeratorUsage}</p>
          </div>
          <div className="analysis-card">
            <h3>Max Washing Machine Usage</h3>
            <p>{analysis.maxWashingMachineUsage}</p>
          </div>
          <div className="analysis-card">
            <h3>Max Heater Usage</h3>
            <p>{analysis.maxHeaterUsage}</p>
          </div>
          <div className="analysis-card">
            <h3>Max Lights Usage</h3>
            <p>{analysis.maxLightsUsage}</p>
          </div>
          <div className="analysis-card">
            <h3>Average Electricity Usage</h3>
            <p>{analysis.averageElectricityUsage}</p>
          </div>
          <div className="analysis-card">
            <h3>Average Fan Usage</h3>
            <p>{analysis.averageFanUsage}</p>
          </div>
          <div className="analysis-card">
            <h3>Average Refrigerator Usage</h3>
            <p>{analysis.averageRefrigeratorUsage}</p>
          </div>
          <div className="analysis-card">
            <h3>Average Washing Machine Usage</h3>
            <p>{analysis.averageWashingMachineUsage}</p>
          </div>
          <div className="analysis-card">
            <h3>Average Heater Usage</h3>
            <p>{analysis.averageHeaterUsage}</p>
          </div>
          <div className="analysis-card">
            <h3>Average Lights Usage</h3>
            <p>{analysis.averageLightsUsage}</p>
          </div>
          <div className="analysis-card">
            <h3>Total Electricity Consumption</h3>
            <p>{analysis.totalElectricityConsumption}</p>
          </div>
          <div className="analysis-card">
            <h3>Total Fan Consumption</h3>
            <p>{analysis.totalFanConsumption}</p>
          </div>
          <div className="analysis-card">
            <h3>Total Refrigerator Consumption</h3>
            <p>{analysis.totalRefrigeratorConsumption}</p>
          </div>
          <div className="analysis-card">
            <h3>Total Washing Machine Consumption</h3>
            <p>{analysis.totalWashingMachineConsumption}</p>
          </div>
          <div className="analysis-card">
            <h3>Total Heater Consumption</h3>
            <p>{analysis.totalHeaterConsumption}</p>
          </div>
          <div className="analysis-card">
            <h3>Total Lights Consumption</h3>
            <p>{analysis.totalLightsConsumption}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricityAnalysis;

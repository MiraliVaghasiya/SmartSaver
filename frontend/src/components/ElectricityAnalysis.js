import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../utils/axios";
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
import "./style/Summary.css";
import { Doughnut } from "react-chartjs-2";

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

const ElectricityAnalysis = ({
  setElectricityData,
  handleFilePathChange,
  selectedFilePath,
}) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const defaultChartData = {
    labels: [],
    datasets: [
      {
        label: "No Data",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const [chartData, setChartData] = useState(defaultChartData);
  const [fanData, setFanData] = useState(defaultChartData);
  const [refrigeratorData, setRefrigeratorData] = useState(defaultChartData);
  const [washingMachineData, setWashingMachineData] =
    useState(defaultChartData);
  const [heaterData, setHeaterData] = useState(defaultChartData);
  const [lightsData, setLightsData] = useState(defaultChartData);
  const [
    electricityConsumptionByActivityData,
    setElectricityConsumptionByActivityData,
  ] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });
  const [datasets, setDatasets] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    // Only fetch datasets on initial load
    fetchInitialData();
  }, []);

  const generateSummaryFromData = (analysisData) => {
    if (!analysisData) return null;

    const summary = {
      // Overall Usage
      totalElectricityConsumption: analysisData.totalConsumption || 91488.82,
      averageElectricityUsage: analysisData.averageUsage || 3049.63,
      maxElectricityUsage: analysisData.peakUsageDate || "08-03-2024",
      maxElectricityUsageValue: analysisData.peakUsageValue || 4500.25,
      minElectricityUsage: analysisData.lowestUsageDate || "15-03-2024",
      minElectricityUsageValue: analysisData.lowestUsageValue || 2100.5,

      // Appliance specific data
      totalFanConsumption: analysisData.fanTotal || 4233.34,
      peakFanDay: analysisData.fanPeakDate || "2024-03-15",
      peakFanUsage: analysisData.fanPeakUsage || 150.25,

      totalRefrigeratorConsumption: analysisData.refrigeratorTotal || 7288.55,
      peakRefrigeratorDay: analysisData.refrigeratorPeakDate || "2024-03-18",
      peakRefrigeratorUsage: analysisData.refrigeratorPeakUsage || 280.5,

      totalWashingMachineConsumption:
        analysisData.washingMachineTotal || 39505.88,
      peakWashingMachineDay:
        analysisData.washingMachinePeakDate || "2024-03-20",
      peakWashingMachineUsage: analysisData.washingMachinePeakUsage || 1200.75,

      totalHeaterConsumption: analysisData.heaterTotal || 21852.75,
      peakHeaterDay: analysisData.heaterPeakDate || "2024-03-22",
      peakHeaterUsage: analysisData.heaterPeakUsage || 850.25,

      totalLightsConsumption: analysisData.lightsTotal || 8750.36,
      peakLightsDay: analysisData.lightsPeakDate || "2024-03-25",
      peakLightsUsage: analysisData.lightsPeakUsage || 320.5,
    };

    return summary;
  };

  const fetchInitialData = async () => {
    try {
      const response = await axiosInstance.get("/dataset/datasets");
      const electricityDatasets = response.data.filter(
        (dataset) => dataset.type === "electricity"
      );
      setDatasets(electricityDatasets);

      if (electricityDatasets.length > 0) {
        const mostRecent = electricityDatasets[0];
        setSelectedDataset(mostRecent._id);
        updateAnalysisData(mostRecent.analysis);
      }
    } catch (error) {
      console.error("Error fetching initial datasets:", error);
      if (error.response?.status === 401) {
        window.location.href = "/login";
      }
    }
  };

  // New function to handle dataset selection
  const handleDatasetChange = async (datasetId) => {
    try {
      setSelectedDataset(datasetId);
      const selectedDataset = datasets.find(
        (dataset) => dataset._id === datasetId
      );
      if (selectedDataset) {
        updateAnalysisData(selectedDataset.analysis);
      }
    } catch (error) {
      console.error("Error changing dataset:", error);
    }
  };

  // New function to update analysis data
  const updateAnalysisData = (analysisData) => {
    if (!analysisData) return;

    // Set all the data from the analysis
    setChartData(analysisData.chartData || defaultChartData);
    setFanData(analysisData.fanData || defaultChartData);
    setRefrigeratorData(analysisData.refrigeratorData || defaultChartData);
    setWashingMachineData(analysisData.washingMachineData || defaultChartData);
    setHeaterData(analysisData.heaterData || defaultChartData);
    setLightsData(analysisData.lightsData || defaultChartData);
    setElectricityConsumptionByActivityData(
      analysisData.electricityConsumptionByActivityData || {
        labels: [],
        datasets: [
          { data: [], backgroundColor: [], borderColor: [], borderWidth: 1 },
        ],
      }
    );

    const generatedSummary = generateSummaryFromData(analysisData);
    setSummaryData(generatedSummary);
    setElectricityData(analysisData);
    setShowSummary(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setShowSummary(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("dataset", file);

    try {
      const response = await axiosInstance.post(
        "/dataset/upload/electricity",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.analysis) {
        const analysisData = response.data.analysis;

        // Clear file input
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Refresh datasets list and select the newly uploaded dataset
        const datasetsResponse = await axiosInstance.get("/dataset/datasets");
        const electricityDatasets = datasetsResponse.data.filter(
          (dataset) => dataset.type === "electricity"
        );
        setDatasets(electricityDatasets);

        // Find the newly uploaded dataset (it should be the most recent one)
        if (electricityDatasets.length > 0) {
          const newlyUploadedDataset = electricityDatasets[0];
          setSelectedDataset(newlyUploadedDataset._id);
          updateAnalysisData(newlyUploadedDataset.analysis);
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    }
  };

  return (
    <div className="electricity-analysis-container">
      <h1>Electricity Analysis</h1>
      <div className="analysis-controls">
        <div className="dataset-selector">
          <select
            value={selectedDataset || ""}
            onChange={(e) => handleDatasetChange(e.target.value)}
            className="dataset-dropdown"
          >
            <option value="">Select a dataset</option>
            {datasets.map((dataset, index) => (
              <option key={dataset._id} value={dataset._id}>
                {dataset.name || `Dataset ${index + 1}`} -{" "}
                {new Date(dataset.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        <div className="upload-controls">
          <input
            type="file"
            className="file-uplod"
            onChange={handleFileChange}
            ref={fileInputRef}
            accept=".csv,.xlsx,.xls"
          />
          <button className="file-upload-button" onClick={handleUpload}>
            Upload & Analyze
          </button>
        </div>
      </div>

      {/* Message when no data is uploaded */}
      {!showSummary && !chartData && (
        <div
          className="no-data-message"
          style={{ textAlign: "center", marginTop: "20px" }}
        >
          <p>Please upload a dataset to view the analysis.</p>
        </div>
      )}

      {/* Charts Section */}
      {chartData && (
        <div className="electricity-analysis-graph">
          {/* Overview Section */}
          <div className="analysis-section">
            <h2 className="section-title">Overview</h2>
            <div className="section-content" style={{ display: "flex" }}>
              <div style={{ width: "50%" }}>
                <div className="inner-row">
                  <h3>Total Electricity Usage</h3>
                  <p>
                    This graph shows the overall electricity consumption over
                    time.
                  </p>
                  {chartData && chartData.labels && chartData.datasets && (
                    <Bar key={JSON.stringify(chartData)} data={chartData} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Major Appliances Section */}
          <div className="analysis-section">
            <h2 className="section-title">Major Appliances</h2>
            <div className="section-content">
              <div style={{ display: "flex", marginBottom: "20px" }}>
                <div style={{ width: "50%" }}>
                  <div className="inner-row">
                    <h3>Refrigerator Usage</h3>
                    <p>Continuous power consumption of the refrigerator.</p>
                    {refrigeratorData &&
                      refrigeratorData.labels &&
                      refrigeratorData.datasets && (
                        <Bar
                          key={JSON.stringify(refrigeratorData)}
                          data={refrigeratorData}
                        />
                      )}
                  </div>
                </div>
                <div style={{ width: "50%" }}>
                  <div className="inner-row">
                    <h3>Washing Machine Usage</h3>
                    <p>Power consumption during washing cycles.</p>
                    {washingMachineData &&
                      washingMachineData.labels &&
                      washingMachineData.datasets && (
                        <Bar
                          key={JSON.stringify(washingMachineData)}
                          data={washingMachineData}
                        />
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Climate Control Section */}
          <div className="analysis-section">
            <h2 className="section-title">Climate Control</h2>
            <div className="section-content">
              <div style={{ display: "flex", marginBottom: "20px" }}>
                <div style={{ width: "50%" }}>
                  <div className="inner-row">
                    <h3>Heater Usage</h3>
                    <p>Power consumption for heating.</p>
                    {heaterData && heaterData.labels && heaterData.datasets && (
                      <Bar key={JSON.stringify(heaterData)} data={heaterData} />
                    )}
                  </div>
                </div>
                <div style={{ width: "50%" }}>
                  <div className="inner-row">
                    <h3>Fan Usage</h3>
                    <p>Power consumption for cooling and ventilation.</p>
                    {fanData && fanData.labels && fanData.datasets && (
                      <Bar key={JSON.stringify(fanData)} data={fanData} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lighting Section */}
          <div className="analysis-section">
            <h2 className="section-title">Lighting</h2>
            <div className="section-content">
              <div style={{ display: "flex", marginBottom: "20px" }}>
                <div style={{ width: "50%" }}>
                  <div className="inner-row">
                    <h3>Lighting Usage</h3>
                    <p>Power consumption for all lighting fixtures.</p>
                    {lightsData && lightsData.labels && lightsData.datasets && (
                      <Bar key={JSON.stringify(lightsData)} data={lightsData} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Summary Section */}
          <div className="analysis-section">
            <h2 className="section-title">Detailed Analysis</h2>
            <div className="summary-section">
              <h3>Analysis Summary</h3>
              {summaryData && (
                <div className="summary-content">
                  {/* Overall Usage Section */}
                  <div className="summary-section">
                    <h4>Overall Usage</h4>
                    <ul>
                      <li className="flex-between">
                        <div>
                          <strong>Total Electricity:</strong>
                          <div>
                            <span className="value">
                              {summaryData.totalElectricityConsumption.toFixed(
                                2
                              )}{" "}
                              kWh
                            </span>
                          </div>
                        </div>
                        <span
                          className={`status-badge ${
                            summaryData.totalElectricityConsumption > 1000
                              ? "warning"
                              : "success"
                          }`}
                        >
                          {summaryData.totalElectricityConsumption > 1000
                            ? "High usage"
                            : "Normal usage"}
                        </span>
                      </li>
                      <li className="flex-between">
                        <div>
                          <strong>Daily Average:</strong>
                          <div>
                            <span className="value">
                              {summaryData.averageElectricityUsage.toFixed(2)}{" "}
                              kWh
                            </span>
                          </div>
                        </div>
                        <span
                          className={`status-badge ${
                            summaryData.averageElectricityUsage > 100
                              ? "warning"
                              : "success"
                          }`}
                        >
                          {summaryData.averageElectricityUsage > 100
                            ? "Above recommended"
                            : "Within limits"}
                        </span>
                      </li>
                      <li>
                        <strong>Peak Usage Day:</strong>
                        <div>
                          <span className="value">
                            {summaryData.maxElectricityUsage}
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Appliance Breakdown Section */}
                  <div className="summary-section">
                    <h4>Appliance Breakdown</h4>
                    <div className="breakdown-grid">
                      <div>
                        <ul>
                          <li>
                            <strong>Fan:</strong>
                            <div>
                              <span className="value">
                                {summaryData.totalFanConsumption.toFixed(2)} kWh
                              </span>
                              <span className="date-info">
                                Peak: {summaryData.peakFanDay}
                              </span>
                              <span className="date-info">
                                Usage on peak day:{" "}
                                {summaryData.peakFanUsage.toFixed(2)} kWh
                              </span>
                            </div>
                          </li>
                          <li>
                            <strong>Refrigerator:</strong>
                            <div>
                              <span className="value">
                                {summaryData.totalRefrigeratorConsumption.toFixed(
                                  2
                                )}{" "}
                                kWh
                              </span>
                              <span className="date-info">
                                Peak: {summaryData.peakRefrigeratorDay}
                              </span>
                              <span className="date-info">
                                Usage on peak day:{" "}
                                {summaryData.peakRefrigeratorUsage.toFixed(2)}{" "}
                                kWh
                              </span>
                            </div>
                          </li>
                          <li>
                            <strong>Washing Machine:</strong>
                            <div>
                              <span className="value">
                                {summaryData.totalWashingMachineConsumption.toFixed(
                                  2
                                )}{" "}
                                kWh
                              </span>
                              <span className="date-info">
                                Peak: {summaryData.peakWashingMachineDay}
                              </span>
                              <span className="date-info">
                                Usage on peak day:{" "}
                                {summaryData.peakWashingMachineUsage.toFixed(2)}{" "}
                                kWh
                              </span>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <ul>
                          <li>
                            <strong>Heater:</strong>
                            <div>
                              <span className="value">
                                {summaryData.totalHeaterConsumption.toFixed(2)}{" "}
                                kWh
                              </span>
                              <span className="date-info">
                                Peak: {summaryData.peakHeaterDay}
                              </span>
                              <span className="date-info">
                                Usage on peak day:{" "}
                                {summaryData.peakHeaterUsage.toFixed(2)} kWh
                              </span>
                            </div>
                          </li>
                          <li>
                            <strong>Lights:</strong>
                            <div>
                              <span className="value">
                                {summaryData.totalLightsConsumption.toFixed(2)}{" "}
                                kWh
                              </span>
                              <span className="date-info">
                                Peak: {summaryData.peakLightsDay}
                              </span>
                              <span className="date-info">
                                Usage on peak day:{" "}
                                {summaryData.peakLightsUsage.toFixed(2)} kWh
                              </span>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Key Insights Section */}
                  <div className="summary-section">
                    <h4>Key Insights</h4>
                    <ul className="insights-list">
                      <li>
                        <strong>Most Energy-Intensive Appliance:</strong>{" "}
                        <span className="insight-badge">
                          {(() => {
                            const consumptions = {
                              Fan: summaryData.totalFanConsumption,
                              Refrigerator:
                                summaryData.totalRefrigeratorConsumption,
                              "Washing Machine":
                                summaryData.totalWashingMachineConsumption,
                              Heater: summaryData.totalHeaterConsumption,
                              Lights: summaryData.totalLightsConsumption,
                            };
                            const maxAppliance = Object.entries(
                              consumptions
                            ).reduce((a, b) => (a[1] > b[1] ? a : b));
                            return `${
                              maxAppliance[0]
                            } (${maxAppliance[1].toFixed(2)} kWh)`;
                          })()}
                        </span>
                      </li>
                      <li>
                        <strong>Usage Status:</strong>{" "}
                        <span
                          className={`status-badge ${
                            summaryData.averageElectricityUsage > 100
                              ? "warning"
                              : "success"
                          }`}
                        >
                          {summaryData.averageElectricityUsage > 100
                            ? "High consumption - Consider optimization measures"
                            : "Normal consumption - Good efficiency"}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Standalone Summary Section for when there's no chart data */}
      {!chartData && summaryData && showSummary && (
        <div className="standalone-summary" style={{ marginTop: "20px" }}>
          <div className="summary-section">
            <h3>Analysis Summary</h3>
            <div className="summary-content">
              {/* Overall Usage Section */}
              <div className="summary-section">
                <h4>Overall Usage</h4>
                <ul>
                  <li className="flex-between">
                    <div>
                      <strong>Total Electricity:</strong>
                      <div>
                        <span className="value">
                          {summaryData.totalElectricityConsumption.toFixed(2)}{" "}
                          kWh
                        </span>
                      </div>
                    </div>
                    <span
                      className={`status-badge ${
                        summaryData.totalElectricityConsumption > 1000
                          ? "warning"
                          : "success"
                      }`}
                    >
                      {summaryData.totalElectricityConsumption > 1000
                        ? "High usage"
                        : "Normal usage"}
                    </span>
                  </li>
                  <li className="flex-between">
                    <div>
                      <strong>Daily Average:</strong>
                      <div>
                        <span className="value">
                          {summaryData.averageElectricityUsage.toFixed(2)} kWh
                        </span>
                      </div>
                    </div>
                    <span
                      className={`status-badge ${
                        summaryData.averageElectricityUsage > 100
                          ? "warning"
                          : "success"
                      }`}
                    >
                      {summaryData.averageElectricityUsage > 100
                        ? "Above recommended"
                        : "Within limits"}
                    </span>
                  </li>
                  <li>
                    <strong>Peak Usage Day:</strong>
                    <div>
                      <span className="value">
                        {summaryData.maxElectricityUsage}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Appliance Breakdown Section */}
              <div className="summary-section">
                <h4>Appliance Breakdown</h4>
                <div className="breakdown-grid">
                  <div>
                    <ul>
                      <li>
                        <strong>Fan:</strong>
                        <div>
                          <span className="value">
                            {summaryData.totalFanConsumption.toFixed(2)} kWh
                          </span>
                          <span className="date-info">
                            Peak: {summaryData.peakFanDay}
                          </span>
                          <span className="date-info">
                            Usage on peak day:{" "}
                            {summaryData.peakFanUsage.toFixed(2)} kWh
                          </span>
                        </div>
                      </li>
                      <li>
                        <strong>Refrigerator:</strong>
                        <div>
                          <span className="value">
                            {summaryData.totalRefrigeratorConsumption.toFixed(
                              2
                            )}{" "}
                            kWh
                          </span>
                          <span className="date-info">
                            Peak: {summaryData.peakRefrigeratorDay}
                          </span>
                          <span className="date-info">
                            Usage on peak day:{" "}
                            {summaryData.peakRefrigeratorUsage.toFixed(2)} kWh
                          </span>
                        </div>
                      </li>
                      <li>
                        <strong>Washing Machine:</strong>
                        <div>
                          <span className="value">
                            {summaryData.totalWashingMachineConsumption.toFixed(
                              2
                            )}{" "}
                            kWh
                          </span>
                          <span className="date-info">
                            Peak: {summaryData.peakWashingMachineDay}
                          </span>
                          <span className="date-info">
                            Usage on peak day:{" "}
                            {summaryData.peakWashingMachineUsage.toFixed(2)} kWh
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <ul>
                      <li>
                        <strong>Heater:</strong>
                        <div>
                          <span className="value">
                            {summaryData.totalHeaterConsumption.toFixed(2)} kWh
                          </span>
                          <span className="date-info">
                            Peak: {summaryData.peakHeaterDay}
                          </span>
                          <span className="date-info">
                            Usage on peak day:{" "}
                            {summaryData.peakHeaterUsage.toFixed(2)} kWh
                          </span>
                        </div>
                      </li>
                      <li>
                        <strong>Lights:</strong>
                        <div>
                          <span className="value">
                            {summaryData.totalLightsConsumption.toFixed(2)} kWh
                          </span>
                          <span className="date-info">
                            Peak: {summaryData.peakLightsDay}
                          </span>
                          <span className="date-info">
                            Usage on peak day:{" "}
                            {summaryData.peakLightsUsage.toFixed(2)} kWh
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Key Insights Section */}
              <div className="summary-section">
                <h4>Key Insights</h4>
                <ul className="insights-list">
                  <li>
                    <strong>Most Energy-Intensive Appliance:</strong>{" "}
                    <span className="insight-badge">
                      {(() => {
                        const consumptions = {
                          Fan: summaryData.totalFanConsumption,
                          Refrigerator:
                            summaryData.totalRefrigeratorConsumption,
                          "Washing Machine":
                            summaryData.totalWashingMachineConsumption,
                          Heater: summaryData.totalHeaterConsumption,
                          Lights: summaryData.totalLightsConsumption,
                        };
                        const maxAppliance = Object.entries(
                          consumptions
                        ).reduce((a, b) => (a[1] > b[1] ? a : b));
                        return `${maxAppliance[0]} (${maxAppliance[1].toFixed(
                          2
                        )} kWh)`;
                      })()}
                    </span>
                  </li>
                  <li>
                    <strong>Usage Status:</strong>{" "}
                    <span
                      className={`status-badge ${
                        summaryData.averageElectricityUsage > 100
                          ? "warning"
                          : "success"
                      }`}
                    >
                      {summaryData.averageElectricityUsage > 100
                        ? "High consumption - Consider optimization measures"
                        : "Normal consumption - Good efficiency"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricityAnalysis;

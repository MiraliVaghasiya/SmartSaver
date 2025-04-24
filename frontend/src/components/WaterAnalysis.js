import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
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
import "./style/Summary.css";

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
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [summaryData, setSummaryData] = useState({
    totalWaterConsumption: 0,
    averageWaterUsage: 0,
    maxWaterUsage: "N/A",
    totalShowerConsumption: 0,
    totalToiletConsumption: 0,
    totalDishwasherConsumption: 0,
    totalWashingMachineConsumption: 0,
    totalSinkConsumption: 0,
    peakShowerDay: "N/A",
    peakToiletDay: "N/A",
    peakDishwasherDay: "N/A",
    peakWashingMachineDay: "N/A",
    peakSinkDay: "N/A",
    peakShowerUsage: 0,
    peakToiletUsage: 0,
    peakDishwasherUsage: 0,
    peakWashingMachineUsage: 0,
    peakSinkUsage: 0,
  });
  const [showSummary, setShowSummary] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    // Fetch water datasets for the current user when component mounts
    fetchWaterDatasets();
  }, []);

  const fetchWaterDatasets = async () => {
    try {
      const response = await axiosInstance.get("/dataset/datasets");
      const waterDatasets = response.data.filter(
        (dataset) => dataset.type === "water"
      );
      setDatasets(waterDatasets);

      // If there are datasets, use the most recent one
      if (waterDatasets.length > 0) {
        const mostRecent = waterDatasets[0];
        setSelectedDataset(mostRecent._id);
        updateAnalysisData(mostRecent.analysis);
      }
    } catch (error) {
      console.error("Error fetching water datasets:", error);
      if (error.response?.status === 401) {
        // Handle unauthorized access
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
    // Update chart data
    setChartData(analysisData.chartData);
    setDrinkingData(analysisData.drinkingData);
    setCookingData(analysisData.cookingData);
    setBathingData(analysisData.bathingData);
    setWashingClothesData(analysisData.washingClothesData);
    setDishwashingData(analysisData.dishwashingData);
    setWaterConsumptionByActivityData(
      analysisData.waterConsumptionByActivityData
    );

    // Calculate totals from chart data
    const calculateTotal = (data) => {
      if (!data?.datasets?.[0]?.data) return 0;
      return data.datasets[0].data.reduce(
        (sum, val) => sum + (Number(val) || 0),
        0
      );
    };

    const calculateAverage = (data) => {
      if (!data?.datasets?.[0]?.data) return 0;
      const total = calculateTotal(data);
      return total / (data.datasets[0].data.length || 1);
    };

    const findPeakDay = (data) => {
      if (!data?.datasets?.[0]?.data || !data?.labels) return "N/A";
      const maxIndex = data.datasets[0].data.indexOf(
        Math.max(...data.datasets[0].data)
      );
      return data.labels[maxIndex] || "N/A";
    };

    const findPeakUsage = (data) => {
      if (!data?.datasets?.[0]?.data) return 0;
      return Math.max(...data.datasets[0].data);
    };

    // Calculate and set summary data
    const summary = {
      totalWaterConsumption: calculateTotal(analysisData.chartData),
      averageWaterUsage: calculateAverage(analysisData.chartData),
      maxWaterUsage: findPeakDay(analysisData.chartData),
      totalShowerConsumption: calculateTotal(analysisData.bathingData),
      totalToiletConsumption: calculateTotal(analysisData.drinkingData),
      totalDishwasherConsumption: calculateTotal(analysisData.dishwashingData),
      totalWashingMachineConsumption: calculateTotal(
        analysisData.washingClothesData
      ),
      totalSinkConsumption: calculateTotal(analysisData.cookingData),
      peakShowerDay: findPeakDay(analysisData.bathingData),
      peakToiletDay: findPeakDay(analysisData.drinkingData),
      peakDishwasherDay: findPeakDay(analysisData.dishwashingData),
      peakWashingMachineDay: findPeakDay(analysisData.washingClothesData),
      peakSinkDay: findPeakDay(analysisData.cookingData),
      peakShowerUsage: findPeakUsage(analysisData.bathingData),
      peakToiletUsage: findPeakUsage(analysisData.drinkingData),
      peakDishwasherUsage: findPeakUsage(analysisData.dishwashingData),
      peakWashingMachineUsage: findPeakUsage(analysisData.washingClothesData),
      peakSinkUsage: findPeakUsage(analysisData.cookingData),
    };

    // Update state
    setSummaryData(summary);
    setWaterData(analysisData);
    setShowSummary(true);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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
        "/dataset/upload/water",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        const analysisData = response.data.analysis;

        // Update chart data
        setChartData(analysisData.chartData);
        setDrinkingData(analysisData.drinkingData);
        setCookingData(analysisData.cookingData);
        setBathingData(analysisData.bathingData);
        setWashingClothesData(analysisData.washingClothesData);
        setDishwashingData(analysisData.dishwashingData);
        setWaterConsumptionByActivityData(
          analysisData.waterConsumptionByActivityData
        );

        // Calculate totals from chart data
        const calculateTotal = (data) => {
          if (!data?.datasets?.[0]?.data) return 0;
          return data.datasets[0].data.reduce(
            (sum, val) => sum + (Number(val) || 0),
            0
          );
        };

        const calculateAverage = (data) => {
          if (!data?.datasets?.[0]?.data) return 0;
          const total = calculateTotal(data);
          return total / (data.datasets[0].data.length || 1);
        };

        const findPeakDay = (data) => {
          if (!data?.datasets?.[0]?.data || !data?.labels) return "N/A";
          const maxIndex = data.datasets[0].data.indexOf(
            Math.max(...data.datasets[0].data)
          );
          return data.labels[maxIndex] || "N/A";
        };

        const findPeakUsage = (data) => {
          if (!data?.datasets?.[0]?.data) return 0;
          return Math.max(...data.datasets[0].data);
        };

        // Calculate and set summary data
        const summary = {
          totalWaterConsumption: calculateTotal(analysisData.chartData),
          averageWaterUsage: calculateAverage(analysisData.chartData),
          maxWaterUsage: findPeakDay(analysisData.chartData),
          totalShowerConsumption: calculateTotal(analysisData.bathingData),
          totalToiletConsumption: calculateTotal(analysisData.drinkingData),
          totalDishwasherConsumption: calculateTotal(
            analysisData.dishwashingData
          ),
          totalWashingMachineConsumption: calculateTotal(
            analysisData.washingClothesData
          ),
          totalSinkConsumption: calculateTotal(analysisData.cookingData),
          peakShowerDay: findPeakDay(analysisData.bathingData),
          peakToiletDay: findPeakDay(analysisData.drinkingData),
          peakDishwasherDay: findPeakDay(analysisData.dishwashingData),
          peakWashingMachineDay: findPeakDay(analysisData.washingClothesData),
          peakSinkDay: findPeakDay(analysisData.cookingData),
          peakShowerUsage: findPeakUsage(analysisData.bathingData),
          peakToiletUsage: findPeakUsage(analysisData.drinkingData),
          peakDishwasherUsage: findPeakUsage(analysisData.dishwashingData),
          peakWashingMachineUsage: findPeakUsage(
            analysisData.washingClothesData
          ),
          peakSinkUsage: findPeakUsage(analysisData.cookingData),
        };

        // Log the data for debugging
        console.log("Analysis Data:", analysisData);
        console.log("Calculated Summary:", summary);

        // Update state
        setSummaryData(summary);
        setWaterData(analysisData);
        setShowSummary(true);

        // Clear file input
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Refresh datasets list
        fetchWaterDatasets();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
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

  const formatNumber = (value) => {
    if (value === undefined || value === null) return "0.00";
    return Number(value).toFixed(2);
  };

  const getStatusBadge = (value, threshold) => {
    const numValue = Number(value) || 0;
    return numValue > threshold ? "warning" : "success";
  };

  const getStatusMessage = (value, threshold) => {
    const numValue = Number(value) || 0;
    return numValue > threshold ? "High usage" : "Normal usage";
  };

  // Add a new useEffect to handle data updates
  useEffect(() => {
    if (chartData && !showSummary) {
      setShowSummary(true);
    }
  }, [chartData]);

  return (
    <div className="water-analysis-container">
      <h1>Water Analysis</h1>
      <div className="analysis-controls">
        <div className="dataset-selector">
          <select
            value={selectedDataset || ""}
            onChange={(e) => handleDatasetChange(e.target.value)}
            className="dataset-dropdown"
          >
            <option value="">Select a dataset</option>
            {datasets.map((dataset, index) => {
              // Extract date from dataset
              let displayDate = "";
              if (
                dataset.analysis &&
                dataset.analysis.chartData &&
                dataset.analysis.chartData.labels &&
                dataset.analysis.chartData.labels.length > 0
              ) {
                try {
                  // Get the first date from the chart data
                  const dateStr = dataset.analysis.chartData.labels[0];
                  // Split the date string and extract month number and year
                  const parts = dateStr.split("-");
                  if (parts.length >= 2) {
                    let monthNum, year;

                    // Check if the part is a month number (01-12)
                    if (parseInt(parts[1]) >= 1 && parseInt(parts[1]) <= 12) {
                      monthNum = parseInt(parts[1]);
                      year = "2024"; // Set the year to 2024
                    } else if (
                      parseInt(parts[0]) >= 1 &&
                      parseInt(parts[0]) <= 12
                    ) {
                      monthNum = parseInt(parts[0]);
                      year = "2024"; // Set the year to 2024
                    } else {
                      monthNum = 1; // Default to January if no valid month
                      year = "2024";
                    }

                    // Convert month number to month name
                    const monthNames = [
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ];
                    const monthName = monthNames[monthNum - 1] || "January";

                    displayDate = `${monthName}-${year}`;
                  }
                } catch (error) {
                  console.error("Error parsing date:", error);
                  displayDate = "January-2024"; // Default fallback
                }
              }

              return (
                <option key={dataset._id} value={dataset._id}>
                  Dataset {index + 1} - {displayDate || "January-2024"}
                </option>
              );
            })}
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
        <div className="water-analysis-graph">
          {/* Overview Section */}
          <div className="analysis-section">
            <h2 className="section-title">Overview</h2>
            <div className="section-content" style={{ display: "flex" }}>
              <div style={{ width: "50%" }}>
                <div className="inner-row">
                  <h3>Total Water Usage</h3>
                  <p>
                    This graph shows the overall water consumption over time.
                  </p>
                  {chartData && chartData.labels && chartData.datasets && (
                    <Bar key={JSON.stringify(chartData)} data={chartData} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bathroom Section */}
          <div className="analysis-section">
            <h2 className="section-title">Bathroom</h2>
            <div className="section-content">
              <div style={{ display: "flex", marginBottom: "20px" }}>
                <div style={{ width: "50%" }}>
                  <div className="inner-row">
                    <h3>Shower Usage</h3>
                    <p>Water consumption during showers.</p>
                    {bathingData &&
                      bathingData.labels &&
                      bathingData.datasets && (
                        <Bar
                          key={JSON.stringify(bathingData)}
                          data={bathingData}
                        />
                      )}
                  </div>
                </div>
                <div style={{ width: "50%" }}>
                  <div className="inner-row">
                    <h3>Toilet Usage</h3>
                    <p>Water consumption for toilet flushing.</p>
                    {bathingData &&
                      bathingData.labels &&
                      bathingData.datasets && (
                        <Bar
                          key={JSON.stringify(bathingData)}
                          data={bathingData}
                        />
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kitchen Section */}
          <div className="analysis-section">
            <h2 className="section-title">Kitchen</h2>
            <div className="section-content">
              <div style={{ display: "flex", marginBottom: "20px" }}>
                <div style={{ width: "50%" }}>
                  <div className="inner-row">
                    <h3>Dishwasher Usage</h3>
                    <p>Water consumption during dishwashing cycles.</p>
                    {dishwashingData &&
                      dishwashingData.labels &&
                      dishwashingData.datasets && (
                        <Bar
                          key={JSON.stringify(dishwashingData)}
                          data={dishwashingData}
                        />
                      )}
                  </div>
                </div>
                <div style={{ width: "50%" }}>
                  <div className="inner-row">
                    <h3>Sink Usage</h3>
                    <p>Water consumption from kitchen sink.</p>
                    {cookingData &&
                      cookingData.labels &&
                      cookingData.datasets && (
                        <Bar
                          key={JSON.stringify(cookingData)}
                          data={cookingData}
                        />
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Laundry Section */}
          <div className="analysis-section">
            <h2 className="section-title">Laundry</h2>
            <div className="section-content">
              <div style={{ display: "flex", marginBottom: "20px" }}>
                <div style={{ width: "50%" }}>
                  <div className="inner-row">
                    <h3>Washing Machine Usage</h3>
                    <p>Water consumption during laundry cycles.</p>
                    {washingClothesData &&
                      washingClothesData.labels &&
                      washingClothesData.datasets && (
                        <Bar
                          key={JSON.stringify(washingClothesData)}
                          data={washingClothesData}
                        />
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
              <div className="summary-content">
                {/* Overall Usage Section */}
                <div className="summary-section">
                  <h4>Overall Usage</h4>
                  <ul>
                    <li className="flex-between">
                      <div>
                        <strong>Total Water:</strong>
                        <div>
                          <span className="value">
                            {formatNumber(summaryData?.totalWaterConsumption)} L
                          </span>
                        </div>
                      </div>
                      <span
                        className={`status-badge ${getStatusBadge(
                          summaryData?.totalWaterConsumption,
                          1000
                        )}`}
                      >
                        {getStatusMessage(
                          summaryData?.totalWaterConsumption,
                          1000
                        )}
                      </span>
                    </li>
                    <li className="flex-between">
                      <div>
                        <strong>Daily Average:</strong>
                        <div>
                          <span className="value">
                            {formatNumber(summaryData?.averageWaterUsage)} L
                          </span>
                        </div>
                      </div>
                      <span
                        className={`status-badge ${getStatusBadge(
                          summaryData?.averageWaterUsage,
                          100
                        )}`}
                      >
                        {getStatusMessage(summaryData?.averageWaterUsage, 100)}
                      </span>
                    </li>
                    <li>
                      <strong>Peak Usage Day:</strong>
                      <div>
                        <span className="value">
                          {summaryData?.maxWaterUsage || "N/A"}
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
                          <strong>Shower:</strong>
                          <div>
                            <span className="value">
                              {formatNumber(
                                summaryData?.totalShowerConsumption
                              )}{" "}
                              L
                            </span>
                            <span className="date-info">
                              Peak: {summaryData?.peakShowerDay || "N/A"}
                            </span>
                            <span className="date-info">
                              Usage on peak day:{" "}
                              {formatNumber(summaryData?.peakShowerUsage)} L
                            </span>
                          </div>
                        </li>
                        <li>
                          <strong>Toilet:</strong>
                          <div>
                            <span className="value">
                              {formatNumber(
                                summaryData?.totalToiletConsumption
                              )}{" "}
                              L
                            </span>
                            <span className="date-info">
                              Peak: {summaryData?.peakToiletDay || "N/A"}
                            </span>
                            <span className="date-info">
                              Usage on peak day:{" "}
                              {formatNumber(summaryData?.peakToiletUsage)} L
                            </span>
                          </div>
                        </li>
                        <li>
                          <strong>Dishwasher:</strong>
                          <div>
                            <span className="value">
                              {formatNumber(
                                summaryData?.totalDishwasherConsumption
                              )}{" "}
                              L
                            </span>
                            <span className="date-info">
                              Peak: {summaryData?.peakDishwasherDay || "N/A"}
                            </span>
                            <span className="date-info">
                              Usage on peak day:{" "}
                              {formatNumber(summaryData?.peakDishwasherUsage)} L
                            </span>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <ul>
                        <li>
                          <strong>Washing Machine:</strong>
                          <div>
                            <span className="value">
                              {formatNumber(
                                summaryData?.totalWashingMachineConsumption
                              )}{" "}
                              L
                            </span>
                            <span className="date-info">
                              Peak:{" "}
                              {summaryData?.peakWashingMachineDay || "N/A"}
                            </span>
                            <span className="date-info">
                              Usage on peak day:{" "}
                              {formatNumber(
                                summaryData?.peakWashingMachineUsage
                              )}{" "}
                              L
                            </span>
                          </div>
                        </li>
                        <li>
                          <strong>Sink:</strong>
                          <div>
                            <span className="value">
                              {formatNumber(summaryData?.totalSinkConsumption)}{" "}
                              L
                            </span>
                            <span className="date-info">
                              Peak: {summaryData?.peakSinkDay || "N/A"}
                            </span>
                            <span className="date-info">
                              Usage on peak day:{" "}
                              {formatNumber(summaryData?.peakSinkUsage)} L
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
                      <strong>Most Water-Intensive Appliance:</strong>{" "}
                      <span className="insight-badge">
                        {(() => {
                          const consumptions = {
                            Shower:
                              Number(summaryData?.totalShowerConsumption) || 0,
                            Toilet:
                              Number(summaryData?.totalToiletConsumption) || 0,
                            Dishwasher:
                              Number(summaryData?.totalDishwasherConsumption) ||
                              0,
                            "Washing Machine":
                              Number(
                                summaryData?.totalWashingMachineConsumption
                              ) || 0,
                            Sink:
                              Number(summaryData?.totalSinkConsumption) || 0,
                          };
                          const maxAppliance = Object.entries(
                            consumptions
                          ).reduce((a, b) => (a[1] > b[1] ? a : b));
                          return `${maxAppliance[0]} (${formatNumber(
                            maxAppliance[1]
                          )} L)`;
                        })()}
                      </span>
                    </li>
                    <li>
                      <strong>Usage Status:</strong>{" "}
                      <span
                        className={`status-badge ${getStatusBadge(
                          summaryData?.averageWaterUsage,
                          100
                        )}`}
                      >
                        {getStatusMessage(summaryData?.averageWaterUsage, 100)}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Summary Section for when there's no chart data */}
      {!chartData && showSummary && (
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
                      <strong>Total Water:</strong>
                      <div>
                        <span className="value">
                          {formatNumber(summaryData?.totalWaterConsumption)} L
                        </span>
                      </div>
                    </div>
                    <span
                      className={`status-badge ${getStatusBadge(
                        summaryData?.totalWaterConsumption,
                        1000
                      )}`}
                    >
                      {getStatusMessage(
                        summaryData?.totalWaterConsumption,
                        1000
                      )}
                    </span>
                  </li>
                  <li className="flex-between">
                    <div>
                      <strong>Daily Average:</strong>
                      <div>
                        <span className="value">
                          {formatNumber(summaryData?.averageWaterUsage)} L
                        </span>
                      </div>
                    </div>
                    <span
                      className={`status-badge ${getStatusBadge(
                        summaryData?.averageWaterUsage,
                        100
                      )}`}
                    >
                      {getStatusMessage(summaryData?.averageWaterUsage, 100)}
                    </span>
                  </li>
                  <li>
                    <strong>Peak Usage Day:</strong>
                    <div>
                      <span className="value">
                        {summaryData?.maxWaterUsage || "N/A"}
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
                        <strong>Shower:</strong>
                        <div>
                          <span className="value">
                            {formatNumber(summaryData?.totalShowerConsumption)}{" "}
                            L
                          </span>
                          <span className="date-info">
                            Peak: {summaryData?.peakShowerDay || "N/A"}
                          </span>
                          <span className="date-info">
                            Usage on peak day:{" "}
                            {formatNumber(summaryData?.peakShowerUsage)} L
                          </span>
                        </div>
                      </li>
                      <li>
                        <strong>Toilet:</strong>
                        <div>
                          <span className="value">
                            {formatNumber(summaryData?.totalToiletConsumption)}{" "}
                            L
                          </span>
                          <span className="date-info">
                            Peak: {summaryData?.peakToiletDay || "N/A"}
                          </span>
                          <span className="date-info">
                            Usage on peak day:{" "}
                            {formatNumber(summaryData?.peakToiletUsage)} L
                          </span>
                        </div>
                      </li>
                      <li>
                        <strong>Dishwasher:</strong>
                        <div>
                          <span className="value">
                            {formatNumber(
                              summaryData?.totalDishwasherConsumption
                            )}{" "}
                            L
                          </span>
                          <span className="date-info">
                            Peak: {summaryData?.peakDishwasherDay || "N/A"}
                          </span>
                          <span className="date-info">
                            Usage on peak day:{" "}
                            {formatNumber(summaryData?.peakDishwasherUsage)} L
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <ul>
                      <li>
                        <strong>Washing Machine:</strong>
                        <div>
                          <span className="value">
                            {formatNumber(
                              summaryData?.totalWashingMachineConsumption
                            )}{" "}
                            L
                          </span>
                          <span className="date-info">
                            Peak: {summaryData?.peakWashingMachineDay || "N/A"}
                          </span>
                          <span className="date-info">
                            Usage on peak day:{" "}
                            {formatNumber(summaryData?.peakWashingMachineUsage)}{" "}
                            L
                          </span>
                        </div>
                      </li>
                      <li>
                        <strong>Sink:</strong>
                        <div>
                          <span className="value">
                            {formatNumber(summaryData?.totalSinkConsumption)} L
                          </span>
                          <span className="date-info">
                            Peak: {summaryData?.peakSinkDay || "N/A"}
                          </span>
                          <span className="date-info">
                            Usage on peak day:{" "}
                            {formatNumber(summaryData?.peakSinkUsage)} L
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
                    <strong>Most Water-Intensive Appliance:</strong>{" "}
                    <span className="insight-badge">
                      {(() => {
                        const consumptions = {
                          Shower:
                            Number(summaryData?.totalShowerConsumption) || 0,
                          Toilet:
                            Number(summaryData?.totalToiletConsumption) || 0,
                          Dishwasher:
                            Number(summaryData?.totalDishwasherConsumption) ||
                            0,
                          "Washing Machine":
                            Number(
                              summaryData?.totalWashingMachineConsumption
                            ) || 0,
                          Sink: Number(summaryData?.totalSinkConsumption) || 0,
                        };
                        const maxAppliance = Object.entries(
                          consumptions
                        ).reduce((a, b) => (a[1] > b[1] ? a : b));
                        return `${maxAppliance[0]} (${formatNumber(
                          maxAppliance[1]
                        )} L)`;
                      })()}
                    </span>
                  </li>
                  <li>
                    <strong>Usage Status:</strong>{" "}
                    <span
                      className={`status-badge ${getStatusBadge(
                        summaryData?.averageWaterUsage,
                        100
                      )}`}
                    >
                      {getStatusMessage(summaryData?.averageWaterUsage, 100)}
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

export default WaterAnalysis;

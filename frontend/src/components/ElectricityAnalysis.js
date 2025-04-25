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
import "./Analysis.css";

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

// Update Calendar component
const Calendar = ({ data, month, year }) => {
  const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (month, year) =>
    new Date(year, month - 1, 1).getDay();

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);

  const getColorForUsage = (usage) => {
    if (!usage) return "#f5f5f5";
    const maxUsage = Math.max(...Object.values(data));
    const percentage = (usage / maxUsage) * 100;

    if (percentage <= 20) return "rgba(216, 180, 254, 0.4)";
    if (percentage <= 40) return "rgba(165, 180, 252, 0.5)";
    if (percentage <= 60) return "rgba(103, 232, 249, 0.6)";
    if (percentage <= 80) return "rgba(110, 231, 183, 0.7)";
    return "rgba(253, 186, 116, 0.8)";
  };

  const getUsageLevel = (usage) => {
    if (!usage) return "No Data";
    const maxUsage = Math.max(...Object.values(data));
    const percentage = (usage / maxUsage) * 100;

    if (percentage <= 20) return "Very Low Usage";
    if (percentage <= 40) return "Low Usage";
    if (percentage <= 60) return "Medium Usage";
    if (percentage <= 80) return "High Usage";
    return "Very High Usage";
  };

  const formatUsage = (usage) => {
    if (!usage) return "0";
    return usage.toFixed(1);
  };

  const generateCalendarDays = () => {
    const days = [];
    const totalSlots = Math.ceil((daysInMonth + firstDay) / 7) * 7;

    for (let i = 0; i < totalSlots; i++) {
      const dayNumber = i - firstDay + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const usage = isValidDay ? data[dayNumber] : null;
      const usageLevel = isValidDay ? getUsageLevel(usage) : "";

      days.push(
        <div
          key={i}
          className="calendar-day"
          style={{
            backgroundColor: isValidDay
              ? getColorForUsage(usage)
              : "transparent",
          }}
          title={isValidDay ? `${usageLevel}: ${formatUsage(usage)} kWh` : ""}
        >
          {isValidDay && (
            <>
              <div className="day-number">{dayNumber}</div>
              <div className="usage-value">{formatUsage(usage)} kWh</div>
              <div className="usage-level">{usageLevel}</div>
            </>
          )}
        </div>
      );
    }
    return days;
  };

  // Get month name
  const monthName = new Date(year, month - 1, 1).toLocaleString("default", {
    month: "long",
  });

  return (
    <div className="calendar-container">
      <h3>{`${monthName} ${year}`}</h3>
      <div className="calendar-header">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="calendar-grid">{generateCalendarDays()}</div>
    </div>
  );
};

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
  const [allDatasetsStats, setAllDatasetsStats] = useState({
    totalAverage: 0,
    totalStdDev: 0,
    dailyAverage: 0,
    dailyStdDev: 0,
    datasetCount: 0,
    applianceAverages: {
      fan: 0,
      refrigerator: 0,
      washingMachine: 0,
      heater: 0,
      lights: 0,
    },
  });

  useEffect(() => {
    // Only fetch datasets on initial load
    fetchInitialData();
  }, []);

  const generateSummaryFromData = (analysisData) => {
    if (!analysisData) return null;

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

    const summary = {
      // Overall Usage
      totalElectricityConsumption: calculateTotal(analysisData.chartData),
      averageElectricityUsage: calculateAverage(analysisData.chartData),
      maxElectricityUsage: findPeakDay(analysisData.chartData),
      maxElectricityUsageValue: findPeakUsage(analysisData.chartData),

      // Appliance specific data
      totalFanConsumption: calculateTotal(analysisData.fanData),
      peakFanDay: findPeakDay(analysisData.fanData),
      peakFanUsage: findPeakUsage(analysisData.fanData),

      totalRefrigeratorConsumption: calculateTotal(
        analysisData.refrigeratorData
      ),
      peakRefrigeratorDay: findPeakDay(analysisData.refrigeratorData),
      peakRefrigeratorUsage: findPeakUsage(analysisData.refrigeratorData),

      totalWashingMachineConsumption: calculateTotal(
        analysisData.washingMachineData
      ),
      peakWashingMachineDay: findPeakDay(analysisData.washingMachineData),
      peakWashingMachineUsage: findPeakUsage(analysisData.washingMachineData),

      totalHeaterConsumption: calculateTotal(analysisData.heaterData),
      peakHeaterDay: findPeakDay(analysisData.heaterData),
      peakHeaterUsage: findPeakUsage(analysisData.heaterData),

      totalLightsConsumption: calculateTotal(analysisData.lightsData),
      peakLightsDay: findPeakDay(analysisData.lightsData),
      peakLightsUsage: findPeakUsage(analysisData.lightsData),
    };

    return summary;
  };

  // Add function to calculate statistics from all datasets
  const calculateAllDatasetsStats = (datasetsArray) => {
    if (!datasetsArray || datasetsArray.length === 0) return;

    let totalConsumptions = [];
    let dailyConsumptions = [];
    let applianceConsumptions = {
      fan: [],
      refrigerator: [],
      washingMachine: [],
      heater: [],
      lights: [],
    };

    // Collect consumption data from all datasets
    datasetsArray.forEach((dataset) => {
      if (dataset.analysis && dataset.analysis.chartData) {
        const total = dataset.analysis.chartData.datasets[0].data.reduce(
          (sum, val) => sum + (Number(val) || 0),
          0
        );
        const daily =
          total / (dataset.analysis.chartData.datasets[0].data.length || 1);

        totalConsumptions.push(total);
        dailyConsumptions.push(daily);

        // Collect appliance-specific data
        if (dataset.analysis.fanData) {
          const fanTotal = dataset.analysis.fanData.datasets[0].data.reduce(
            (sum, val) => sum + (Number(val) || 0),
            0
          );
          applianceConsumptions.fan.push(fanTotal);
        }
        if (dataset.analysis.refrigeratorData) {
          const refrigeratorTotal =
            dataset.analysis.refrigeratorData.datasets[0].data.reduce(
              (sum, val) => sum + (Number(val) || 0),
              0
            );
          applianceConsumptions.refrigerator.push(refrigeratorTotal);
        }
        if (dataset.analysis.washingMachineData) {
          const washingTotal =
            dataset.analysis.washingMachineData.datasets[0].data.reduce(
              (sum, val) => sum + (Number(val) || 0),
              0
            );
          applianceConsumptions.washingMachine.push(washingTotal);
        }
        if (dataset.analysis.heaterData) {
          const heaterTotal =
            dataset.analysis.heaterData.datasets[0].data.reduce(
              (sum, val) => sum + (Number(val) || 0),
              0
            );
          applianceConsumptions.heater.push(heaterTotal);
        }
        if (dataset.analysis.lightsData) {
          const lightsTotal =
            dataset.analysis.lightsData.datasets[0].data.reduce(
              (sum, val) => sum + (Number(val) || 0),
              0
            );
          applianceConsumptions.lights.push(lightsTotal);
        }
      }
    });

    // Calculate averages
    const totalAvg =
      totalConsumptions.reduce((a, b) => a + b, 0) / totalConsumptions.length;
    const dailyAvg =
      dailyConsumptions.reduce((a, b) => a + b, 0) / dailyConsumptions.length;

    // Calculate standard deviations
    const totalStdDev = Math.sqrt(
      totalConsumptions.reduce((sq, n) => sq + Math.pow(n - totalAvg, 2), 0) /
        totalConsumptions.length
    );
    const dailyStdDev = Math.sqrt(
      dailyConsumptions.reduce((sq, n) => sq + Math.pow(n - dailyAvg, 2), 0) /
        dailyConsumptions.length
    );

    // Calculate appliance averages
    const applianceAverages = {
      fan:
        applianceConsumptions.fan.reduce((a, b) => a + b, 0) /
        applianceConsumptions.fan.length,
      refrigerator:
        applianceConsumptions.refrigerator.reduce((a, b) => a + b, 0) /
        applianceConsumptions.refrigerator.length,
      washingMachine:
        applianceConsumptions.washingMachine.reduce((a, b) => a + b, 0) /
        applianceConsumptions.washingMachine.length,
      heater:
        applianceConsumptions.heater.reduce((a, b) => a + b, 0) /
        applianceConsumptions.heater.length,
      lights:
        applianceConsumptions.lights.reduce((a, b) => a + b, 0) /
        applianceConsumptions.lights.length,
    };

    setAllDatasetsStats({
      totalAverage: totalAvg,
      totalStdDev: totalStdDev,
      dailyAverage: dailyAvg,
      dailyStdDev: dailyStdDev,
      datasetCount: datasetsArray.length,
      applianceAverages,
    });
  };

  // Modify the fetchInitialData function to calculate stats
  const fetchInitialData = async () => {
    try {
      const response = await axiosInstance.get("/dataset/datasets");
      const electricityDatasets = response.data.filter(
        (dataset) => dataset.type === "electricity"
      );
      setDatasets(electricityDatasets);

      // Calculate statistics from all datasets
      calculateAllDatasetsStats(electricityDatasets);

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

  const getStatusBadge = (value, type = "total") => {
    const numValue = Number(value) || 0;

    // Different thresholds for different types of measurements (in kWh)
    const thresholds = {
      total: {
        low: 250, // 250 kWh - Very efficient monthly usage
        medium: 500, // 500 kWh - Average monthly usage
        high: 750, // 750+ kWh - High monthly usage
      },
      daily: {
        low: 8, // 8 kWh - Efficient daily usage
        medium: 15, // 15 kWh - Average daily usage
        high: 25, // 25+ kWh - High daily usage
      },
      fan: {
        low: 0.5, // 0.5 kWh - Efficient daily fan usage
        medium: 1.2, // 1.2 kWh - Average daily fan usage
        high: 2.0, // 2.0+ kWh - High daily fan usage
      },
      refrigerator: {
        low: 1.5, // 1.5 kWh - Energy efficient refrigerator daily
        medium: 2.5, // 2.5 kWh - Average refrigerator daily
        high: 4.0, // 4.0+ kWh - Inefficient refrigerator daily
      },
      washing: {
        low: 1.0, // 1.0 kWh - Efficient washing cycle
        medium: 2.0, // 2.0 kWh - Average washing cycle
        high: 3.0, // 3.0+ kWh - Inefficient washing cycle
      },
      heater: {
        low: 3.0, // 3.0 kWh - Efficient daily heater usage
        medium: 6.0, // 6.0 kWh - Average daily heater usage
        high: 10.0, // 10.0+ kWh - High daily heater usage
      },
      lights: {
        low: 0.5, // 0.5 kWh - LED lights daily usage
        medium: 1.5, // 1.5 kWh - Mixed LED/traditional daily
        high: 3.0, // 3.0+ kWh - Inefficient lighting daily
      },
    };

    const threshold = thresholds[type] || thresholds.total;

    if (numValue <= threshold.low) return "success";
    if (numValue <= threshold.medium) return "warning";
    return "danger";
  };

  // Modify getStatusMessage to use comparative analysis
  const getStatusMessage = (value, type = "total") => {
    const numValue = Number(value) || 0;

    // Function to determine status based on standard deviations from mean
    const getComparativeStatus = (value, mean, stdDev) => {
      const zScore = (value - mean) / stdDev;
      if (zScore < -0.5) return "Low";
      if (zScore > 0.5) return "High";
      return "Average";
    };

    // For total consumption
    if (type === "total" && allDatasetsStats.datasetCount > 0) {
      const status = getComparativeStatus(
        numValue,
        allDatasetsStats.totalAverage,
        allDatasetsStats.totalStdDev
      );
      return `<span style="color: black">${status} Consumption (${numValue.toFixed(
        1
      )} kWh vs. Avg ${allDatasetsStats.totalAverage.toFixed(1)} kWh)</span>`;
    }

    // For daily consumption
    if (type === "daily" && allDatasetsStats.datasetCount > 0) {
      const status = getComparativeStatus(
        numValue,
        allDatasetsStats.dailyAverage,
        allDatasetsStats.dailyStdDev
      );
      return `<span style="color: black">${status} Consumption (${numValue.toFixed(
        1
      )} kWh vs. Avg ${allDatasetsStats.dailyAverage.toFixed(1)} kWh)</span>`;
    }

    // For appliance-specific consumption
    if (
      allDatasetsStats.datasetCount > 0 &&
      allDatasetsStats.applianceAverages[type]
    ) {
      const avgValue = allDatasetsStats.applianceAverages[type];
      const status =
        numValue < avgValue * 0.8
          ? "Low"
          : numValue > avgValue * 1.2
          ? "High"
          : "Average";
      return `<span style="color: black">${status} Consumption (${numValue.toFixed(
        1
      )} kWh vs. Avg ${avgValue.toFixed(1)} kWh)</span>`;
    }

    // Fallback to original thresholds
    const thresholds = {
      total: { low: 250, medium: 500 },
      daily: { low: 8, medium: 15 },
      fan: { low: 0.5, medium: 1.2 },
      refrigerator: { low: 1.5, medium: 2.5 },
      washing: { low: 1.0, medium: 2.0 },
      heater: { low: 3.0, medium: 6.0 },
      lights: { low: 0.5, medium: 1.5 },
    };

    const threshold = thresholds[type] || thresholds.total;
    if (numValue <= threshold.low)
      return `<span style="color: black">Low Consumption (≤${threshold.low} kWh)</span>`;
    if (numValue <= threshold.medium)
      return `<span style="color: black">Average Consumption (≤${threshold.medium} kWh)</span>`;
    return `<span style="color: black">High Consumption (>${threshold.medium} kWh)</span>`;
  };

  // Add comparative analysis section to the summary
  const renderComparativeAnalysis = () => {
    if (allDatasetsStats.datasetCount < 2) return null;

    return (
      <div className="summary-section">
        <h4>Comparative Analysis</h4>
        <ul className="insights-list">
          <li>
            <strong>Dataset Comparison:</strong> Analysis based on{" "}
            {allDatasetsStats.datasetCount} datasets
          </li>
          <li>
            <strong>Your Total Usage vs Average:</strong>{" "}
            {summaryData?.totalElectricityConsumption.toFixed(1)} kWh vs{" "}
            {allDatasetsStats.totalAverage.toFixed(1)} kWh
          </li>
          <li>
            <strong>Your Daily Usage vs Average:</strong>{" "}
            {summaryData?.averageElectricityUsage.toFixed(1)} kWh vs{" "}
            {allDatasetsStats.dailyAverage.toFixed(1)} kWh
          </li>
        </ul>
      </div>
    );
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
      {(!showSummary ||
        !chartData ||
        !chartData.labels ||
        chartData.labels.length === 0) && (
        <div
          className="no-data-message"
          style={{ textAlign: "center", marginTop: "20px" }}
        >
          <p>Please upload a dataset to view the analysis.</p>
        </div>
      )}

      {/* Charts Section - Only show when there is actual data */}
      {chartData && chartData.labels && chartData.labels.length > 0 && (
        <div className="electricity-analysis-graph">
          {/* Overview Section */}
          <div
            className="analysis-section"
            style={{
              overflow: "hidden",
            }}
          >
            <h2 className="section-title">Overview</h2>
            <div
              className="section-content"
              style={{
                width: "100%",
                overflow: "hidden",
                height: "calc(100% - 40px)",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <div
                  className="inner-row"
                  style={{
                    width: "100%",
                    overflowX: "auto",
                    overflowY: "hidden",
                    marginBottom: "20px",
                    padding: "20px",
                  }}
                >
                  <h3>Total Electricity Usage</h3>
                  <p>
                    This graph shows the breakdown of electricity consumption by
                    different utilities over time.
                  </p>
                  <div
                    style={{
                      width: "100%",
                      minWidth: "800px",
                      position: "relative",
                      paddingBottom: "20px",
                      height: "calc(100% - 80px)",
                    }}
                  >
                    {chartData && chartData.labels && (
                      <Line
                        data={{
                          labels: chartData.labels,
                          datasets: [
                            {
                              label: "Fan",
                              data: fanData?.datasets[0]?.data || [],
                              fill: true,
                              tension: 0.3,
                              backgroundColor: "rgba(187, 157, 255, 0.5)",
                              borderColor: "rgba(187, 157, 255, 1)",
                              pointRadius: 3,
                              pointBackgroundColor: "rgba(187, 157, 255, 1)",
                              borderWidth: 1,
                              order: 1,
                            },
                            {
                              label: "Washing Machine",
                              data: washingMachineData?.datasets[0]?.data || [],
                              fill: true,
                              tension: 0.3,
                              backgroundColor: "rgba(255, 220, 130, 0.5)",
                              borderColor: "rgba(255, 220, 130, 1)",
                              pointRadius: 3,
                              pointBackgroundColor: "rgba(255, 220, 130, 1)",
                              borderWidth: 1,
                              order: 2,
                            },
                            {
                              label: "Heater",
                              data: heaterData?.datasets[0]?.data || [],
                              fill: true,
                              tension: 0.3,
                              backgroundColor: "rgba(255, 190, 140, 0.5)",
                              borderColor: "rgba(255, 190, 140, 1)",
                              pointRadius: 3,
                              pointBackgroundColor: "rgba(255, 190, 140, 1)",
                              borderWidth: 1,
                              order: 3,
                            },
                            {
                              label: "Refrigerator",
                              data: refrigeratorData?.datasets[0]?.data || [],
                              fill: true,
                              tension: 0.3,
                              backgroundColor: "rgba(255, 170, 180, 0.5)",
                              borderColor: "rgba(255, 170, 180, 1)",
                              pointRadius: 3,
                              pointBackgroundColor: "rgba(255, 170, 180, 1)",
                              borderWidth: 1,
                              order: 4,
                            },
                            {
                              label: "Lights",
                              data: lightsData?.datasets[0]?.data || [],
                              fill: true,
                              tension: 0.3,
                              backgroundColor: "rgba(140, 220, 220, 0.5)",
                              borderColor: "rgba(140, 220, 220, 1)",
                              pointRadius: 3,
                              pointBackgroundColor: "rgba(140, 220, 220, 1)",
                              borderWidth: 1,
                              order: 5,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: {
                            mode: "nearest",
                            axis: "x",
                            intersect: false,
                          },
                          scales: {
                            x: {
                              grid: {
                                display: true,
                                color: "rgba(0, 0, 0, 0.05)",
                              },
                              ticks: {
                                maxRotation: 45,
                                minRotation: 45,
                                color: "#666",
                                font: {
                                  size: 10,
                                },
                              },
                            },
                            y: {
                              stacked: true,
                              grid: {
                                display: true,
                                color: "rgba(0, 0, 0, 0.05)",
                              },
                              ticks: {
                                color: "#666",
                                font: {
                                  size: 11,
                                },
                              },
                              title: {
                                display: true,
                                text: "Electricity Usage (kWh)",
                                color: "#666",
                                font: {
                                  size: 12,
                                  weight: "normal",
                                },
                              },
                            },
                          },
                          plugins: {
                            tooltip: {
                              mode: "index",
                              intersect: false,
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              titleColor: "#000",
                              bodyColor: "#666",
                              borderColor: "#ddd",
                              borderWidth: 1,
                              padding: 10,
                              displayColors: true,
                              callbacks: {
                                title: function (context) {
                                  return context[0].label;
                                },
                                label: function (context) {
                                  let label = context.dataset.label || "";
                                  if (label) {
                                    label += ": ";
                                  }
                                  if (context.parsed.y !== null) {
                                    label +=
                                      context.parsed.y.toFixed(1) + " kWh";
                                  }
                                  return label;
                                },
                              },
                            },
                            legend: {
                              position: "top",
                              align: "center",
                              labels: {
                                usePointStyle: true,
                                padding: 15,
                                boxWidth: 8,
                                boxHeight: 8,
                                color: "#666",
                                font: {
                                  size: 11,
                                },
                              },
                            },
                          },
                        }}
                        style={{
                          height: "400px",
                          width: "100%",
                          background: "white",
                          padding: "15px",
                          borderRadius: "8px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Calendar View */}
          <div className="analysis-section">
            <h2 className="section-title">Monthly Usage Calendar</h2>
            <div className="section-content">
              <p>
                Daily electricity consumption overview with color-coded
                intensity.
              </p>
              {chartData && chartData.labels && (
                <Calendar
                  data={chartData.datasets[0].data.reduce(
                    (acc, value, index) => {
                      // Parse the date from the label (assuming format: "DD-MM-YYYY" or "DD/MM/YYYY")
                      const label = chartData.labels[index];
                      const parts = label.includes("-")
                        ? label.split("-")
                        : label.split("/");
                      const day = parseInt(parts[0]);
                      const month = parseInt(parts[1]);
                      const year = parseInt(parts[2]) || 2024;

                      acc[day] = value;
                      return acc;
                    },
                    {}
                  )}
                  month={(() => {
                    // Get month from the first label
                    const firstLabel = chartData.labels[0];
                    const parts = firstLabel.includes("-")
                      ? firstLabel.split("-")
                      : firstLabel.split("/");
                    return parseInt(parts[1]);
                  })()}
                  year={(() => {
                    // Get year from the first label
                    const firstLabel = chartData.labels[0];
                    const parts = firstLabel.includes("-")
                      ? firstLabel.split("-")
                      : firstLabel.split("/");
                    return parseInt(parts[2]) || 2024;
                  })()}
                />
              )}
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
                          className={`status-badge ${getStatusBadge(
                            summaryData?.totalElectricityConsumption,
                            "total"
                          )}`}
                          dangerouslySetInnerHTML={{
                            __html: getStatusMessage(
                              summaryData?.totalElectricityConsumption,
                              "total"
                            ),
                          }}
                        ></span>
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
                          className={`status-badge ${getStatusBadge(
                            summaryData?.averageElectricityUsage,
                            "daily"
                          )}`}
                          dangerouslySetInnerHTML={{
                            __html: getStatusMessage(
                              summaryData?.averageElectricityUsage,
                              "daily"
                            ),
                          }}
                        ></span>
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
                              Fan: summaryData?.totalFanConsumption || 0,
                              Refrigerator:
                                summaryData?.totalRefrigeratorConsumption || 0,
                              "Washing Machine":
                                summaryData?.totalWashingMachineConsumption ||
                                0,
                              Heater: summaryData?.totalHeaterConsumption || 0,
                              Lights: summaryData?.totalLightsConsumption || 0,
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
                          className={`status-badge ${getStatusBadge(
                            summaryData?.averageElectricityUsage,
                            "daily"
                          )}`}
                          dangerouslySetInnerHTML={{
                            __html: getStatusMessage(
                              summaryData?.averageElectricityUsage,
                              "daily"
                            ),
                          }}
                        ></span>
                      </li>
                    </ul>
                  </div>

                  {renderComparativeAnalysis()}
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
                      className={`status-badge ${getStatusBadge(
                        summaryData?.totalElectricityConsumption,
                        "total"
                      )}`}
                      dangerouslySetInnerHTML={{
                        __html: getStatusMessage(
                          summaryData?.totalElectricityConsumption,
                          "total"
                        ),
                      }}
                    ></span>
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
                      className={`status-badge ${getStatusBadge(
                        summaryData?.averageElectricityUsage,
                        "daily"
                      )}`}
                      dangerouslySetInnerHTML={{
                        __html: getStatusMessage(
                          summaryData?.averageElectricityUsage,
                          "daily"
                        ),
                      }}
                    ></span>
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
                          Fan: summaryData?.totalFanConsumption || 0,
                          Refrigerator:
                            summaryData?.totalRefrigeratorConsumption || 0,
                          "Washing Machine":
                            summaryData?.totalWashingMachineConsumption || 0,
                          Heater: summaryData?.totalHeaterConsumption || 0,
                          Lights: summaryData?.totalLightsConsumption || 0,
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
                      className={`status-badge ${getStatusBadge(
                        summaryData?.averageElectricityUsage,
                        "daily"
                      )}`}
                      dangerouslySetInnerHTML={{
                        __html: getStatusMessage(
                          summaryData?.averageElectricityUsage,
                          "daily"
                        ),
                      }}
                    ></span>
                  </li>
                </ul>
              </div>

              {renderComparativeAnalysis()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricityAnalysis;

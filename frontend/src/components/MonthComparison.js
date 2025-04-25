import React, { useState, useEffect } from "react";
import "./style/Summary.css";
import "./Analysis.css";

const MonthComparison = ({ datasets, onCompare }) => {
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

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

  // Function to get the total water consumption for a specific month from a dataset
  const getMonthTotal = (dataset, monthName) => {
    if (
      !dataset?.analysis?.chartData?.labels ||
      !dataset?.analysis?.chartData?.datasets?.[0]?.data
    ) {
      return 0;
    }

    let total = 0;
    const labels = dataset.analysis.chartData.labels;
    const data = dataset.analysis.chartData.datasets[0].data;

    // Iterate through the labels and sum up the values for the specified month
    labels.forEach((label, index) => {
      // Parse the date from the label (format: "DD-MM-YYYY" or "DD/MM/YYYY")
      const parts = label.includes("-") ? label.split("-") : label.split("/");
      const monthNum = parseInt(parts[1]) - 1; // Convert to 0-based month index

      if (monthNames[monthNum] === monthName) {
        total += parseFloat(data[index]) || 0;
      }
    });

    return total;
  };

  // Function to get available months from all datasets
  const getAvailableMonths = () => {
    const monthsData = {};

    datasets.forEach((dataset) => {
      if (dataset?.analysis?.chartData?.labels) {
        dataset.analysis.chartData.labels.forEach((label) => {
          const parts = label.includes("-")
            ? label.split("-")
            : label.split("/");
          const monthNum = parseInt(parts[1]) - 1;
          const monthName = monthNames[monthNum];
          const total = getMonthTotal(dataset, monthName);

          if (total > 0) {
            monthsData[monthName] = total;
          }
        });
      }
    });

    return monthsData;
  };

  const handleMonthSelect = (month) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter((m) => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  const compareMonths = () => {
    if (selectedMonths.length < 2) {
      alert("Please select at least two months to compare");
      return;
    }

    const results = selectedMonths.map((month) => {
      const total = datasets.reduce(
        (sum, dataset) => sum + getMonthTotal(dataset, month),
        0
      );
      const daysInMonth = new Date(
        2024,
        monthNames.indexOf(month) + 1,
        0
      ).getDate();
      const dailyAverage = total / daysInMonth;

      return {
        month,
        total: total || 0,
        dailyAverage: dailyAverage || 0,
        hasData: total > 0,
      };
    });

    setComparisonResults(results);
    if (onCompare) {
      onCompare(results);
    }
  };

  return (
    <>
      <button
        className={`toggle-button ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle month comparison"
      >
        {isOpen ? "◀" : "▶"}
      </button>

      <div className={`month-comparison ${isOpen ? "open" : ""}`}>
        <div className="comparison-header">
          <h2>Compare Months</h2>
        </div>

        <div className="comparison-content">
          <div className="month-grid">
            {monthNames.map((month) => {
              const monthData = getAvailableMonths()[month];
              const isSelected = selectedMonths.includes(month);

              return (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(month)}
                  className={`month-button ${isSelected ? "selected" : ""}`}
                >
                  {month} {monthData ? `(${monthData.toFixed(2)}L)` : ""}
                </button>
              );
            })}
          </div>

          <button
            className="compare-button"
            onClick={compareMonths}
            disabled={selectedMonths.length < 2}
          >
            Compare Selected Months
          </button>

          {comparisonResults && (
            <div className="comparison-results">
              <h3>📊 Comparison Results</h3>
              <div className="monthly-totals">
                <h4>Monthly Totals:</h4>
                {comparisonResults.map((result) => (
                  <div key={result.month} className="month-result">
                    <h5>
                      {result.month} {result.hasData ? "" : "(N/A)"}:
                    </h5>
                    <p>Total: {result.total.toFixed(2)} liters</p>
                    <p>
                      Daily average: {result.dailyAverage.toFixed(2)} liters
                    </p>
                  </div>
                ))}
              </div>

              {comparisonResults.length >= 2 && (
                <div className="comparison-analysis">
                  <h4>Analysis:</h4>
                  {(() => {
                    const sorted = [...comparisonResults].sort(
                      (a, b) => b.total - a.total
                    );
                    const highest = sorted[0];
                    const lowest = sorted[sorted.length - 1];
                    const difference = highest.total - lowest.total;
                    const percentageDiff =
                      (difference / lowest.total) * 100 || 0;

                    return (
                      <>
                        <p>
                          <strong>Highest Usage:</strong> {highest.month} (
                          {highest.total.toFixed(2)} liters)
                        </p>
                        <p>
                          <strong>Lowest Usage:</strong> {lowest.month} (
                          {lowest.total.toFixed(2)} liters)
                        </p>
                        {highest.total > 0 && lowest.total > 0 && (
                          <p>
                            <strong>Difference:</strong> {difference.toFixed(2)}{" "}
                            liters ({percentageDiff.toFixed(1)}%{" "}
                            {difference > 0 ? "increase" : "decrease"})
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MonthComparison;

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const xlsx = require("xlsx");

const router = express.Router();

// Ensure the uploads directory exists
const uploadDir = "./uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure file upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Saving file to:", uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log("Received file:", file.originalname);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  // limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".csv", ".txt", ".xlsx"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      console.error("Unsupported file type:", file.originalname);
      return cb(
        new Error(
          "Unsupported file type. Please upload a CSV, TXT, or XLSX file."
        )
      );
    }

    cb(null, true);
  },
});

router.post("/upload/water", upload.single("dataset"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("File upload failed!");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File uploaded successfully:", req.file);

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let data = [];

    if (fileExt === ".csv") {
      data = await processCSVFile(filePath);
    } else if (fileExt === ".txt") {
      data = await processCSVFile(filePath);
    } else if (fileExt === ".xlsx") {
      data = await processXLSXFile(filePath);
    } else {
      return res.status(400).json({ error: "Unsupported file format" });
    }

    const analysis = analyzeWaterUsage(data);
    res.json({
      success: true,
      usagePerDay: analysis.usagePerDay,
      summary: analysis,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
});

router.post(
  "/upload/electricity",
  upload.single("dataset"),
  async (req, res) => {
    try {
      if (!req.file) {
        console.error("File upload failed!");
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log("File uploaded successfully:", req.file);

      const filePath = req.file.path;
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      let data = [];

      if (fileExt === ".csv") {
        data = await processCSVFile(filePath);
      } else if (fileExt === ".txt") {
        data = await processCSVFile(filePath);
      } else if (fileExt === ".xlsx") {
        data = await processXLSXFile(filePath);
      } else {
        return res.status(400).json({ error: "Unsupported file format" });
      }

      const analysis = analyzeElectricityUsage(data);
      res.json({
        success: true,
        usagePerDay: analysis.usagePerDay,
        summary: analysis,
      });
    } catch (error) {
      console.error("Upload Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error", error });
    }
  }
);

// Function to process CSV/TXT file
function processCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

// Function to process XLSX file
function processXLSXFile(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet);
  } catch (err) {
    throw new Error("Error reading Excel file");
  }
}

// Analyze water usage trends
function analyzeWaterUsage(data) {
  let totalWaterUsage = 0;
  let maxWaterUsage = 0;
  let peakWaterDay = null;

  let usagePerDay = {};

  data.forEach((item) => {
    const timestamp = item["Timestamp"];
    const date = timestamp.split(" ")[0];
    const waterUsage = parseFloat(item["Total Water (Liters)"] || 0);
    const drinking = parseFloat(item["Drinking (Liters)"] || 0);
    const cooking = parseFloat(item["Cooking (Liters)"] || 0);
    const bathing = parseFloat(item["Bathing (Liters)"] || 0);
    const washingClothes = parseFloat(item["Washing Clothes (Liters)"] || 0);
    const dishwashing = parseFloat(item["Dishwashing (Liters)"] || 0);

    if (!date) return;

    totalWaterUsage += waterUsage;

    if (!usagePerDay[date]) {
      usagePerDay[date] = {
        waterUsage: 0,
        drinking: 0,
        cooking: 0,
        bathing: 0,
        washingClothes: 0,
        dishwashing: 0,
      };
    }

    usagePerDay[date].waterUsage += waterUsage;
    usagePerDay[date].drinking += drinking;
    usagePerDay[date].cooking += cooking;
    usagePerDay[date].bathing += bathing;
    usagePerDay[date].washingClothes += washingClothes;
    usagePerDay[date].dishwashing += dishwashing;

    if (usagePerDay[date].waterUsage > maxWaterUsage) {
      maxWaterUsage = usagePerDay[date].waterUsage;
      peakWaterDay = date;
    }
  });

  // Calculate average water usage per day
  const averageWaterUsage = totalWaterUsage / Object.keys(usagePerDay).length;

  // Calculate total water usage per week
  const totalWaterUsagePerWeek = {};
  Object.keys(usagePerDay).forEach((date) => {
    const week = getWeekNumber(date);
    if (!totalWaterUsagePerWeek[week]) {
      totalWaterUsagePerWeek[week] = 0;
    }
    totalWaterUsagePerWeek[week] += usagePerDay[date].waterUsage;
  });

  // Calculate total water usage per month
  const totalWaterUsagePerMonth = {};
  Object.keys(usagePerDay).forEach((date) => {
    const month = getMonth(date);
    if (!totalWaterUsagePerMonth[month]) {
      totalWaterUsagePerMonth[month] = 0;
    }
    totalWaterUsagePerMonth[month] += usagePerDay[date].waterUsage;
  });

  // Find the day with the most water usage for each activity
  const mostWaterUsageDays = {};
  Object.keys(usagePerDay).forEach((date) => {
    const activities = [
      "drinking",
      "cooking",
      "bathing",
      "washingClothes",
      "dishwashing",
    ];
    activities.forEach((activity) => {
      if (
        !mostWaterUsageDays[activity] ||
        usagePerDay[date][activity] > mostWaterUsageDays[activity].usage
      ) {
        mostWaterUsageDays[activity] = {
          date,
          usage: usagePerDay[date][activity],
        };
      }
    });
  });

  // Provide suggestions to the user
  const suggestions = [];
  if (averageWaterUsage > 100) {
    suggestions.push(
      "Consider reducing your water usage by using water-efficient appliances."
    );
  }
  if (maxWaterUsage > 200) {
    suggestions.push(
      "Consider installing a smart meter to monitor your water usage in real-time."
    );
  }

  // Calculate the day with the most water usage for each activity
  const mostWaterUsageDayByActivity = {};
  Object.keys(mostWaterUsageDays).forEach((activity) => {
    mostWaterUsageDayByActivity[activity] = mostWaterUsageDays[activity].date;
  });

  // Calculate the total water usage for each activity
  const totalWaterUsageByActivity = {};
  Object.keys(usagePerDay).forEach((date) => {
    const activities = [
      "drinking",
      "cooking",
      "bathing",
      "washingClothes",
      "dishwashing",
    ];
    activities.forEach((activity) => {
      if (!totalWaterUsageByActivity[activity]) {
        totalWaterUsageByActivity[activity] = 0;
      }
      totalWaterUsageByActivity[activity] += usagePerDay[date][activity];
    });
  });

  // Calculate the percentage of water usage for each activity
  const percentageWaterUsageByActivity = {};
  Object.keys(totalWaterUsageByActivity).forEach((activity) => {
    percentageWaterUsageByActivity[activity] =
      (totalWaterUsageByActivity[activity] / totalWaterUsage) * 100;
  });

  return {
    totalWaterUsage,
    peakWaterDay,
    maxWaterUsage,
    usagePerDay,
    averageWaterUsage,
    totalWaterUsagePerWeek,
    totalWaterUsagePerMonth,
    mostWaterUsageDays,
    mostWaterUsageDayByActivity,
    totalWaterUsageByActivity,
    percentageWaterUsageByActivity,
    suggestions,
  };
}

// Helper function to get the week number from a date
function getWeekNumber(date) {
  const dateParts = date.split("-");
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]);
  const day = parseInt(dateParts[2]);
  const dateObject = new Date(year, month - 1, day);
  const firstDayOfYear = new Date(year, 0, 1);
  const daysSinceFirstDayOfYear = Math.floor(
    (dateObject - firstDayOfYear) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((daysSinceFirstDayOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Helper function to get the month from a date
function getMonth(date) {
  const dateParts = date.split("-");
  return dateParts[0] + "-" + dateParts[1];
}

// Analyze electricity usage trends
function analyzeElectricityUsage(data) {
  let totalElectricityUsage = 0;
  let maxElectricityUsage = 0;
  let peakElectricityDay = null;

  let usagePerDay = {};

  data.forEach((item) => {
    const timestamp = item["Timestamp"];
    const date = timestamp.split(" ")[0];
    const electricityUsage = parseFloat(item["Total Electricity (kWh)"] || 0);
    const fan = parseFloat(item["Fan (kWh)"] || 0);
    const refrigerator = parseFloat(item["Refrigerator (kWh)"] || 0);
    const washingMachine = parseFloat(item["Washing Machine (kWh)"] || 0);
    const heater = parseFloat(item["Heater (kWh)"] || 0);
    const lights = parseFloat(item["Lights (kWh)"] || 0);

    if (!date) return;

    totalElectricityUsage += electricityUsage;

    if (!usagePerDay[date]) {
      usagePerDay[date] = {
        timestamp: timestamp,
        electricityUsage: 0,
        fan: 0,
        refrigerator: 0,
        washingMachine: 0,
        heater: 0,
        lights: 0,
      };
    }

    usagePerDay[date].timestamp = timestamp;
    usagePerDay[date].electricityUsage += electricityUsage;
    usagePerDay[date].fan += fan;
    usagePerDay[date].refrigerator += refrigerator;
    usagePerDay[date].washingMachine += washingMachine;
    usagePerDay[date].heater += heater;
    usagePerDay[date].lights += lights;

    if (usagePerDay[date].electricityUsage > maxElectricityUsage) {
      maxElectricityUsage = usagePerDay[date].electricityUsage;
      peakElectricityDay = date;
    }
  });

  // Calculate average electricity usage per day
  const averageElectricityUsage =
    totalElectricityUsage / Object.keys(usagePerDay).length;

  // Provide suggestions to the user
  const suggestions = [];
  if (averageElectricityUsage > 10) {
    suggestions.push(
      "Consider reducing your electricity usage by using energy-efficient appliances."
    );
  }
  if (maxElectricityUsage > 20) {
    suggestions.push(
      "Consider installing a smart meter to monitor your electricity usage in real-time."
    );
  }

  return {
    totalElectricityUsage,
    peakElectricityDay,
    maxElectricityUsage,
    usagePerDay,
    averageElectricityUsage,
    suggestions,
  };
}

module.exports = router;

import React, { useState, useRef, useEffect } from "react";
import "./style/ChatBot.css";

const ChatBot = ({ waterData, electricityData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content:
        "Hi! 👋 I'm your SmartSaver assistant. I can help you analyze your water and electricity usage. What would you like to know?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getWaterUsageData = () => {
    return {
      total: 91488.82,
      daily: 3049.63,
      peakDay: "08-03-2024",
      appliances: {
        shower: {
          usage: 39505.88,
          peakDay: "13-03-2024",
          peakUsage: 1464.55,
          percentage: 43.18,
        },
        toilet: {
          usage: 4233.34,
          peakDay: "16-03-2024",
          peakUsage: 162.91,
          percentage: 4.63,
        },
        dishwasher: {
          usage: 8750.36,
          peakDay: "29-03-2024",
          peakUsage: 327.16,
          percentage: 9.56,
        },
        washingMachine: {
          usage: 21852.75,
          peakDay: "05-03-2024",
          peakUsage: 809.64,
          percentage: 23.89,
        },
        sink: {
          usage: 7288.55,
          peakDay: "11-03-2024",
          peakUsage: 279.02,
          percentage: 7.97,
        },
      },
    };
  };

  const getElectricityUsageData = () => {
    if (
      !electricityData?.chartData?.datasets?.[0]?.data ||
      !electricityData?.chartData?.labels
    ) {
      return null;
    }

    const values = electricityData.chartData.datasets[0].data.map((v) =>
      parseFloat(v)
    );
    const labels = electricityData.chartData.labels;
    const total = values.reduce((sum, val) => sum + val, 0);
    const daily = total / values.length;
    const peak = Math.max(...values);
    const peakIndex = values.indexOf(peak);
    const peakDay = labels[peakIndex];

    // Calculate appliance breakdown if available
    const appliances = {};
    const applianceCategories = {
      heater: electricityData.heaterData,
      ac: electricityData.acData,
      refrigerator: electricityData.refrigeratorData,
      washingMachine: electricityData.washingMachineData,
      lights: electricityData.lightsData,
      other: electricityData.otherData,
    };

    let totalApplianceUsage = 0;
    Object.entries(applianceCategories).forEach(([key, data]) => {
      if (data?.datasets?.[0]?.data) {
        const applianceValues = data.datasets[0].data.map((v) => parseFloat(v));
        const applianceTotal = applianceValues.reduce(
          (sum, val) => sum + val,
          0
        );
        const appliancePeak = Math.max(...applianceValues);
        const appliancePeakIndex = applianceValues.indexOf(appliancePeak);

        appliances[key] = {
          usage: applianceTotal,
          peakDay: data.labels[appliancePeakIndex],
          peakUsage: appliancePeak,
          percentage: 0, // Will be calculated after total is known
        };
        totalApplianceUsage += applianceTotal;
      }
    });

    // Calculate percentages
    Object.values(appliances).forEach((appliance) => {
      appliance.percentage = (appliance.usage / totalApplianceUsage) * 100;
    });

    return {
      total,
      daily,
      peakDay,
      peak,
      appliances,
    };
  };

  const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split("-");
    const months = [
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
    return `${months[parseInt(month) - 1]} ${day}, ${year}`;
  };

  const generateElectricitySavingTips = (appliance) => {
    const data = getElectricityUsageData();
    if (!data?.appliances) return null;

    const tips = {
      heater: [
        `Your water heater uses ${data.appliances.heater?.percentage?.toFixed(
          1
        )}% of your electricity (${data.appliances.heater?.usage?.toFixed(
          0
        )} kWh). Try setting it to 120°F (49°C) for optimal efficiency.`,
        "Install a timer to heat water only when needed.",
        "Insulate your water heater and pipes to reduce heat loss.",
      ],
      ac: [
        `Air conditioning accounts for ${data.appliances.ac?.percentage?.toFixed(
          1
        )}% of usage (${data.appliances.ac?.usage?.toFixed(
          0
        )} kWh). Consider using a programmable thermostat.`,
        "Clean or replace AC filters monthly for better efficiency.",
        "Use ceiling fans along with AC to distribute cool air better.",
      ],
      refrigerator: [
        `Your refrigerator consumes ${data.appliances.refrigerator?.percentage?.toFixed(
          1
        )}% of power (${data.appliances.refrigerator?.usage?.toFixed(
          0
        )} kWh). Keep it at optimal temperature (37-40°F).`,
        "Check door seals and clean condenser coils regularly.",
        "Avoid keeping the door open for long periods.",
      ],
      washingMachine: [
        `Your washing machine uses ${data.appliances.washingMachine?.percentage?.toFixed(
          1
        )}% of electricity (${data.appliances.washingMachine?.usage?.toFixed(
          0
        )} kWh). Use cold water when possible.`,
        "Run full loads to maximize efficiency.",
        "Use the high-spin setting to reduce drying time.",
      ],
      lights: [
        `Lighting accounts for ${data.appliances.lights?.percentage?.toFixed(
          1
        )}% of usage (${data.appliances.lights?.usage?.toFixed(
          0
        )} kWh). Switch to LED bulbs to save up to 75%.`,
        "Use natural light when possible during the day.",
        "Install motion sensors or timers for outdoor lights.",
      ],
      other: [
        `Other appliances use ${data.appliances.other?.percentage?.toFixed(
          1
        )}% of your power (${data.appliances.other?.usage?.toFixed(
          0
        )} kWh). Unplug devices when not in use.`,
        "Use power strips to easily turn off multiple devices.",
        "Consider upgrading to energy-efficient appliances.",
      ],
    };
    return tips[appliance] || tips;
  };

  const compareMonthlyData = (data, months) => {
    if (!data) return null;

    const monthData = {};
    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    // Initialize data for requested months
    months.forEach((month) => {
      monthData[month.toLowerCase()] = {
        total: 0,
        daily: 0,
        appliances: {},
      };
    });

    // Process water data for each appliance
    if (data.appliances) {
      Object.entries(data.appliances).forEach(([appliance, applianceData]) => {
        const monthIndex = parseInt(applianceData.peakDay.split("-")[1]) - 1;
        const month = monthNames[monthIndex];

        if (months.includes(month)) {
          if (!monthData[month].appliances[appliance]) {
            monthData[month].appliances[appliance] = {
              usage: 0,
              percentage: 0,
              peakUsage: 0,
              peakDay: "",
            };
          }

          monthData[month].appliances[appliance] = {
            usage: applianceData.usage,
            percentage: applianceData.percentage,
            peakUsage: applianceData.peakUsage,
            peakDay: applianceData.peakDay,
          };

          monthData[month].total += applianceData.usage;
        }
      });

      // Calculate daily averages
      Object.keys(monthData).forEach((month) => {
        const daysInMonth = month === "march" ? 31 : 30;
        monthData[month].daily = monthData[month].total / daysInMonth;
      });
    }

    return monthData;
  };

  const generateComparisonResponse = (type, months, data) => {
    const comparison = compareMonthlyData(data, months);
    if (!comparison)
      return "I couldn't find data for the specified months to compare.";

    let response = `📊 Detailed ${type} Usage Comparison (${months.join(
      " vs "
    )})\n\n`;

    // Total usage comparison
    response += "📈 Monthly Totals:\n";
    months.forEach((month) => {
      const monthData = comparison[month.toLowerCase()];
      if (type === "water") {
        response += `• ${
          month.charAt(0).toUpperCase() + month.slice(1)
        }: ${monthData.total.toFixed(0)} liters\n`;
        response += `  Daily average: ${monthData.daily.toFixed(0)} liters\n`;
      } else {
        response += `• ${
          month.charAt(0).toUpperCase() + month.slice(1)
        }: ${monthData.total.toFixed(1)} kWh\n`;
        response += `  Daily average: ${monthData.daily.toFixed(1)} kWh\n`;
      }
    });

    // Calculate and show percentage difference
    const firstMonthData = comparison[months[0].toLowerCase()];
    const secondMonthData = comparison[months[1].toLowerCase()];
    const difference =
      ((secondMonthData.total - firstMonthData.total) / firstMonthData.total) *
      100;

    response += `\n📊 Usage Change:\n`;
    response += `• ${Math.abs(difference).toFixed(1)}% ${
      difference > 0 ? "increase" : "decrease"
    } from ${months[0]} to ${months[1]}\n`;

    // Appliance breakdown comparison
    response += "\n🔍 Top Consumers by Month:\n";
    months.forEach((month) => {
      const monthLower = month.toLowerCase();
      const sortedAppliances = Object.entries(
        comparison[monthLower].appliances
      ).sort((a, b) => b[1].usage - a[1].usage);

      response += `\n${month.charAt(0).toUpperCase() + month.slice(1)}:\n`;
      sortedAppliances.forEach(([appliance, data]) => {
        const unit = type === "water" ? "liters" : "kWh";
        response += `• ${appliance}: ${data.usage.toFixed(
          0
        )} ${unit} (${data.percentage.toFixed(1)}%)\n`;
      });
    });

    // Add insights and recommendations
    response += "\n💡 Key Insights:\n";
    if (Math.abs(difference) > 15) {
      response += `• There's a significant ${
        difference > 0 ? "increase" : "decrease"
      } in usage (${Math.abs(difference).toFixed(1)}%)\n`;
    }

    // Find common high-usage appliances
    const commonAppliances = new Set();
    Object.entries(comparison[months[0].toLowerCase()].appliances)
      .sort((a, b) => b[1].usage - a[1].usage)
      .slice(0, 2)
      .forEach(([appliance]) => commonAppliances.add(appliance));

    Object.entries(comparison[months[1].toLowerCase()].appliances)
      .sort((a, b) => b[1].usage - a[1].usage)
      .slice(0, 2)
      .forEach(([appliance]) => commonAppliances.add(appliance));

    if (commonAppliances.size > 0) {
      response += `• Consistently high usage: ${Array.from(
        commonAppliances
      ).join(", ")}\n`;
    }

    response +=
      "\nWould you like specific tips to reduce consumption for any of these appliances?";

    return response;
  };

  const generateWaterSavingTips = (appliance) => {
    const tips = {
      shower: [
        "🚿 Install a water-efficient showerhead (can save up to 40%)",
        "⏲️ Limit shower time to 5 minutes (saves ~15 liters/minute)",
        "🔧 Fix any leaks in shower fixtures",
        "🌡️ Use moderate water temperature to reduce hot water usage",
      ],
      washingMachine: [
        "👕 Only run full loads of laundry",
        "🌊 Use the appropriate water level for load size",
        "❄️ Use cold water when possible",
        "⭐ Choose the eco mode for regular loads",
      ],
      dishwasher: [
        "🍽️ Run only full loads",
        "🚰 Skip pre-rinsing dishes (saves up to 20 liters per load)",
        "⚡ Use eco mode when available",
        "📊 Choose shorter wash cycles for lightly soiled dishes",
      ],
      sink: [
        "🚰 Install aerators on faucets",
        "🔧 Fix dripping faucets immediately",
        "🧼 Turn off tap while brushing teeth or washing dishes",
        "⏱️ Use a timer for tasks requiring running water",
      ],
      toilet: [
        "🚽 Install a dual-flush system",
        "💧 Check for and fix any leaks",
        "🪣 Consider using greywater for flushing",
        "📏 Adjust the water level in the tank if too high",
      ],
    };
    return tips[appliance] || [];
  };

  const generateResponse = async (query) => {
    query = query.toLowerCase();

    // Track last comparison for follow-up questions
    const lastComparisonKey = "lastComparison";
    const lastAppliances =
      messages.length > 0
        ? messages[messages.length - 1].content.match(
            /Consistently high usage: ([^\\n]+)/
          )
        : null;

    // Handle follow-up questions about tips
    if (
      (query.includes("yes") ||
        query.includes("tips") ||
        query.includes("how")) &&
      messages.length > 0 &&
      messages[messages.length - 1].content.includes(
        "Would you like specific tips"
      )
    ) {
      if (lastAppliances) {
        const appliances = lastAppliances[1].split(", ");
        let response =
          "💡 Here are specific tips for your highest-usage appliances:\n\n";

        appliances.forEach((appliance) => {
          const tips = generateWaterSavingTips(appliance);
          if (tips.length > 0) {
            response += `${appliance.toUpperCase()}:\n`;
            tips.forEach((tip) => (response += `${tip}\n`));
            response += "\n";
          }
        });

        response +=
          "Would you like to know more about your usage patterns or get tips for other appliances?";
        return response;
      }
    }

    // Handle comparison queries
    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    const months = monthNames.filter((month) => query.includes(month));

    if (
      months.length >= 2 ||
      (query.includes("compare") && query.includes("between")) ||
      query.includes("dataset")
    ) {
      // Store comparison context for follow-up questions
      let response;
      if (query.includes("electricity")) {
        const elecData = getElectricityUsageData();
        response = generateComparisonResponse("electricity", months, elecData);
      } else {
        const waterData = getWaterUsageData();
        response = generateComparisonResponse("water", months, waterData);
      }

      // Add interactive prompts
      response += "\n\nYou can ask me to:\n";
      response += "1. Get saving tips for specific appliances\n";
      response += "2. See detailed usage patterns for any month\n";
      response += "3. Compare with different months\n";
      response += "4. Analyze peak usage days\n\n";
      response += "What would you like to know more about?";

      return response;
    }

    // Handle appliance-specific queries
    if (
      query.includes("tips for") ||
      query.includes("how to save") ||
      query.includes("reduce usage")
    ) {
      const appliances = [
        "shower",
        "washingMachine",
        "dishwasher",
        "sink",
        "toilet",
      ];
      const matchedAppliance = appliances.find((app) =>
        query.includes(app.toLowerCase())
      );

      if (matchedAppliance) {
        const tips = generateWaterSavingTips(matchedAppliance);
        let response = `💡 Tips to reduce ${matchedAppliance} water usage:\n\n`;
        tips.forEach((tip) => (response += `${tip}\n`));
        response +=
          "\nWould you like tips for other appliances or to see your usage patterns?";
        return response;
      }
    }

    // Handle electricity-specific queries
    if (query.includes("electricity")) {
      const elecData = getElectricityUsageData();

      // Handle total electricity usage
      if (query.includes("total") || query.includes("overall")) {
        if (elecData) {
          return `⚡ Your total electricity consumption is ${elecData.total.toFixed(
            0
          )} kWh, averaging ${elecData.daily.toFixed(
            1
          )} kWh per day. Peak usage was ${elecData.peak.toFixed(
            1
          )} kWh on ${formatDate(
            elecData.peakDay
          )}. Would you like to see which appliances are using the most power?`;
        }
        return "I don't have access to your electricity data yet. Would you like to know how to upload it?";
      }

      // Handle peak usage for electricity
      if (query.includes("peak") || query.includes("highest")) {
        if (elecData) {
          const peakAppliance = Object.entries(elecData.appliances).sort(
            (a, b) => b[1].peakUsage - a[1].peakUsage
          )[0];

          return (
            `⚡ Peak Electricity Analysis:\n\n` +
            `• Highest usage: ${elecData.peak.toFixed(1)} kWh on ${formatDate(
              elecData.peakDay
            )}\n` +
            `• Main contributor: ${
              peakAppliance[0]
            } (${peakAppliance[1].peakUsage.toFixed(1)} kWh)\n` +
            `• Daily average: ${elecData.daily.toFixed(1)} kWh\n\n` +
            `Would you like tips to reduce your peak consumption?`
          );
        }
        return "I need your electricity data to analyze peak usage patterns. Would you like to know how to upload it?";
      }

      // Handle appliance breakdown for electricity
      if (
        query.includes("appliance") ||
        query.includes("breakdown") ||
        query.includes("using most")
      ) {
        if (elecData?.appliances) {
          const sortedAppliances = Object.entries(elecData.appliances).sort(
            (a, b) => b[1].usage - a[1].usage
          );

          let response = `⚡ Electricity Usage Breakdown:\n\n`;
          sortedAppliances.slice(0, 3).forEach(([name, data]) => {
            response += `• ${name}: ${data.percentage.toFixed(
              1
            )}% (${data.usage.toFixed(0)} kWh)\n`;
          });

          return (
            response +
            `\nWould you like specific saving tips for any of these appliances?`
          );
        }
        return "I don't have detailed appliance data for electricity yet. Would you like to know how to set that up?";
      }

      // Handle saving tips for electricity
      if (
        query.includes("tip") ||
        query.includes("save") ||
        query.includes("reduce")
      ) {
        if (elecData?.appliances) {
          const highestConsumer = Object.entries(elecData.appliances).sort(
            (a, b) => b[1].usage - a[1].usage
          )[0];

          const tips = generateElectricitySavingTips(highestConsumer[0]);

          return (
            `💡 Based on your electricity usage:\n\n` +
            tips.slice(0, 3).join("\n\n") +
            `\n\nWould you like specific tips for other appliances?`
          );
        }
        return "I can provide better tips once I have your electricity usage data. Would you like to know how to share it?";
      }
    }

    // Handle water-specific queries
    if (
      query.includes("water") ||
      (!query.includes("electricity") && query.includes("peak"))
    ) {
      const waterData = getWaterUsageData();

      // Handle peak water usage
      if (query.includes("peak") || query.includes("highest")) {
        const peakAppliance = Object.entries(waterData.appliances).sort(
          (a, b) => b[1].peakUsage - a[1].peakUsage
        )[0];

        return (
          `💧 Peak Water Usage:\n\n` +
          `• Highest day: ${formatDate(
            waterData.peakDay
          )} (${waterData.daily.toFixed(0)} liters)\n` +
          `• Main source: ${
            peakAppliance[0]
          } (${peakAppliance[1].peakUsage.toFixed(0)} liters)\n` +
          `• That's about ${(waterData.daily / 100).toFixed(
            0
          )} full bathtubs in one day!\n\n` +
          `Would you like to know how to reduce your peak usage?`
        );
      }

      // Handle total water usage
      if (query.includes("total") || query.includes("overall")) {
        return `📊 Your total water usage is ${waterData.total.toFixed(
          0
        )} liters, averaging ${waterData.daily.toFixed(
          0
        )} liters per day. To put this in perspective, that's like filling ${(
          waterData.total / 200
        ).toFixed(
          0
        )} bathtubs this month! Would you like to see a breakdown by appliance?`;
      }

      // Handle appliance breakdown for water
      if (
        query.includes("appliance") ||
        query.includes("breakdown") ||
        query.includes("using most")
      ) {
        const sortedAppliances = Object.entries(waterData.appliances).sort(
          (a, b) => b[1].usage - a[1].usage
        );

        const highest = sortedAppliances[0];
        const second = sortedAppliances[1];

        return (
          `🚰 Here's what's using your water:\n\n` +
          `• Your ${
            highest[0]
          } is the biggest consumer at ${highest[1].percentage.toFixed(
            1
          )}% (${highest[1].usage.toFixed(0)} liters)\n` +
          `• The ${second[0]} follows at ${second[1].percentage.toFixed(
            1
          )}% (${second[1].usage.toFixed(0)} liters)\n\n` +
          `Would you like specific tips to reduce your ${highest[0]} water usage?`
        );
      }
    }

    // Handle general peak usage queries
    if (query.includes("peak") || query.includes("highest")) {
      const waterData = getWaterUsageData();
      const elecData = getElectricityUsageData();

      let response = "📊 Peak Usage Analysis:\n\n";

      if (waterData) {
        response +=
          `💧 Water:\n` +
          `• Highest: ${waterData.daily.toFixed(0)} liters on ${formatDate(
            waterData.peakDay
          )}\n` +
          `• Main source: ${
            Object.entries(waterData.appliances).sort(
              (a, b) => b[1].peakUsage - a[1].peakUsage
            )[0][0]
          }\n\n`;
      }

      if (elecData) {
        response +=
          `⚡ Electricity:\n` +
          `• Highest: ${elecData.peak.toFixed(1)} kWh on ${formatDate(
            elecData.peakDay
          )}\n` +
          `• Main consumer: ${
            Object.entries(elecData.appliances).sort(
              (a, b) => b[1].peakUsage - a[1].peakUsage
            )[0][0]
          }`;
      }

      return (
        response + "\n\nWould you like detailed analysis for either utility?"
      );
    }

    // Handle general queries
    if (
      query.includes("ai") ||
      query.includes("what are you") ||
      query.includes("who are you")
    ) {
      return "I'm SmartSaver, your personal utility efficiency assistant! I can analyze both your water and electricity usage patterns to help you save money and resources. What would you like to know about your consumption?";
    }

    // Default response
    return (
      "I can help you analyze your utility usage! Try asking about:\n\n" +
      "⚡ Electricity:\n" +
      "  • Total consumption and costs\n" +
      "  • Appliance breakdown\n" +
      "  • Peak usage times\n" +
      "  • Energy-saving tips\n\n" +
      "💧 Water:\n" +
      "  • Usage patterns\n" +
      "  • High-consumption areas\n" +
      "  • Conservation tips\n\n" +
      "What would you like to explore?"
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: "user",
      content: inputMessage,
    };
    setMessages((prev) => [...prev, userMessage]);

    const response = await generateResponse(inputMessage);

    const botMessage = {
      type: "bot",
      content: response,
    };
    setMessages((prev) => [...prev, botMessage]);

    setInputMessage("");
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          <span className="chat-icon">💬</span>
          Chat with SmartSaver
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>SmartSaver Assistant</h3>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          <div className="messages-container">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                {message.type === "bot" && (
                  <span className="bot-avatar">🤖</span>
                )}
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your utility usage..."
              className="message-input"
            />
            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

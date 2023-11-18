require("dotenv").config();
const express = require("express");
const path = require("path");
const { connectDb } = require("./config/db.js");
const morgan = require("morgan");
const cron = require("node-cron");
const fs = require("fs");
const Employee = require("./models/Employee.js");
const cors = require("cors");
const MonthlyCompare = require("./models/MonthlyCompare.js");
const Transaction = require("./models/Transaction.js");

connectDb();
const app = express();

//Parsing Json data
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// Logger
app.use((req, res, next) => {
  const { method, url, ip } = req;
  fs.appendFile(
    "./logs/ServerLogs.txt",
    `${Date.now()} ${method} ${url} ${ip} \n`,
    "utf8",
    (err) => {
      if (err) throw err;
    }
  );
  next();
});

// Routes
app.use("/api/v1/users", require("./routes/user.js"));


// Static files
if (process.env.NODE_MODE === "production") {
  app.use("/", express.static(path.join(__dirname, "client", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client/build", "index.html"));
  });
}
// cron.schedule("0 0 1 * *", async () => {
// cron.schedule("*/1 * * * *", async () => {
//   try {
//     console.log("Task started... for salary reset");
//     // checking for the current month status
//     const month = await Employee.find({
//       salaryDate: {
//         $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
//         $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
//       },
//     });
//     console.log(month);
//     // Set salary status to 'remaining' for all employees
//     await Employee.updateMany({}, { $set: { salaryStatus: "Pending" } });
    
//     console.log('Salary status reset to "remaining" at the end of the month.');
//     console.log("Task completed...");
//   } catch (error) {
//     console.error("Error resetting salary status:", error);
//   }
// });

cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Checking salary status for employees...');

    // Get the current date
    const currentDate = new Date();

    // Check if it's the start of a new month (day 1)
    if (currentDate.getDate() === 1) {
      // Set the salary status to "Pending" for all employees
      await Employee.updateMany({}, { $set: { salaryStatus: 'Pending' } });

      console.log('Salary status updated for a new month.');
    } else {
      console.log('Not the start of a new month.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

// -----------------------------------------------------------------------------------------------------------------------------
cron.schedule('0 0 1 * *', async () => {
  try {
    console.log('Task started...');
    // Get the current month's data
    const currentMonthTransactions = await Transaction.find({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
    });

    const currentMonthData = calculateMonthlyData(currentMonthTransactions);

    // Get the previous month's data from the MonthlyCompare model
    const previousMonthData = await MonthlyCompare.findOne({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    // If there is no previous month data, set it to zero
    const previousData = previousMonthData || {
      totalIncome: 0,
      totalExpense: 0,
      totalSaves: 0,
      totalInvestment: 0,
    };
    console.log('Previous month data in cron:', previousData);
    console.log('Current month data in cron:', currentMonthData);
    // Calculate percentage changes
    const percentageChanges = calculatePercentageChanges(
      previousData,
      currentMonthData
    );

    // Update the MonthlyCompare model with the current month's data
    await MonthlyCompare.findOneAndUpdate(
      { createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      currentMonthData,
      { upsert: true } // Create a new document if not found
    );

  } catch (error) {
    console.error('Error updating MonthlyCompare model:', error);
  }
});

// Helper function to calculate monthly data from transactions
function calculateMonthlyData(transactions) {
  const result = {
    totalIncome: 0,
    totalExpense: 0,
    totalInvestment: 0,
    totalSaves: 0,
  };

  transactions.forEach((transaction) => {
    switch (transaction.type) {
      case "Income":
        result.totalIncome += transaction.amount;
        result.totalSaves += transaction.amount; // Increment totalSaves for Income
        break;
      case "Expense":
        result.totalExpense += transaction.amount;
        result.totalSaves -= transaction.amount; // Decrement totalSaves for Expense
        break;
      case "Investment":
        result.totalInvestment += transaction.amount;
        result.totalSaves -= transaction.amount; // Decrement totalSaves for Investment
        break;
      default:
        break;
    }
  });
  return result;
}

// Helper function to calculate percentage changes
function calculatePercentageChanges(previousData, currentData) {
  const percentageChanges = {};

  for (const category in currentData) {
    if (currentData.hasOwnProperty(category)) {
     
      const percentageChange =
        ((currentData[category] - previousData[category]) /
          Math.abs(previousData[category] || 1)) * 100;

      percentageChanges[category] = percentageChange;
    }
  }
console.log(percentageChanges);
  return percentageChanges;
}

// -----------------------------------------------------------------------------------------------------------------------------

app.get("*.css", (req, res, next) => {
  res.contentType("text/css");
  next();
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on Port ${process.env.PORT}`);
});

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
const { google } = require("googleapis");
const readline = require("readline");

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
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Checking salary status for employees...");

    // Get the current date
    const currentDate = new Date();

    // Check if it's the start of a new month (day 1)
    if (currentDate.getDate() === 1) {
      // Set the salary status to "Pending" for all employees
      await Employee.updateMany({}, { $set: { salaryStatus: "Pending" } });

      console.log("Salary status updated for a new month.");
    } else {
      console.log("Not the start of a new month.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

// -----------------------------------------------------------------------------------------------------------------------------
// cron.schedule('0 0 1 * *', async () => {
//   try {
//     console.log('Task started...');
//     // Get the current month's data
//     const currentMonthTransactions = await Transaction.find({
//       createdAt: {
//         $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
//         $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
//       },
//     });

//     const currentMonthData = calculateMonthlyData(currentMonthTransactions);

//     // Get the previous month's data from the MonthlyCompare model
//     const previousMonthData = await MonthlyCompare.findOne({
//       createdAt: {
//         $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
//         $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
//       },
//     });

//     // If there is no previous month data, set it to zero
//     const previousData = previousMonthData || {
//       totalIncome: 0,
//       totalExpense: 0,
//       totalSaves: 0,
//       totalInvestment: 0,
//     };
//     console.log('Previous month data in cron:', previousData);
//     console.log('Current month data in cron:', currentMonthData);
//     // Calculate percentage changes
//     const percentageChanges = calculatePercentageChanges(
//       previousData,
//       currentMonthData
//     );

//     // Update the MonthlyCompare model with the current month's data
//     await MonthlyCompare.findOneAndUpdate(
//       { createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
//       currentMonthData,
//       { upsert: true } // Create a new document if not found
//     );

//   } catch (error) {
//     console.error('Error updating MonthlyCompare model:', error);
//   }
// });

// // Helper function to calculate monthly data from transactions
// function calculateMonthlyData(transactions) {
//   const result = {
//     totalIncome: 0,
//     totalExpense: 0,
//     totalInvestment: 0,
//     totalSaves: 0,
//   };

//   transactions.forEach((transaction) => {
//     switch (transaction.type) {
//       case "Income":
//         result.totalIncome += transaction.amount;
//         result.totalSaves += transaction.amount; // Increment totalSaves for Income
//         break;
//       case "Expense":
//         result.totalExpense += transaction.amount;
//         result.totalSaves -= transaction.amount; // Decrement totalSaves for Expense
//         break;
//       case "Investment":
//         result.totalInvestment += transaction.amount;
//         result.totalSaves -= transaction.amount; // Decrement totalSaves for Investment
//         break;
//       default:
//         break;
//     }
//   });
//   return result;
// }

// // Helper function to calculate percentage changes
// function calculatePercentageChanges(previousData, currentData) {
//   const percentageChanges = {};

//   for (const category in currentData) {
//     if (currentData.hasOwnProperty(category)) {

//       const percentageChange =
//         ((currentData[category] - previousData[category]) /
//           Math.abs(previousData[category] || 1)) * 100;

//       percentageChanges[category] = percentageChange;
//     }
//   }
// console.log(percentageChanges);
//   return percentageChanges;
// }

// -----------------------------------------------------------------------------------------------------------------------------
// cron.schedule('*/1 * * * *', async () => {

// ---------Setting cron job self try--------------------------------------------------------------------------------------------------------------------
cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("Task started...");
    const date = new Date();
    // setting the date to the first day of the month for testing
    // Check if it's the start of a new month (day 1)
    if (date.getDate() === 1) {
      // const currentIncome = await Transaction.find({type: 'Income', createdAt: {$gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)}}).sum('amount');
      // const currentExpense = await Transaction.find({type: 'Expense', createdAt: {$gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)}}).sum('amount');
      // const currentInvestment = await Transaction.find({type: 'Investment', createdAt: {$gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)}}).sum('amount');
      // const currentSaves = currentIncome - currentExpense - currentInvestment;
      const transactions = await Transaction.find({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      });
      let currentIncome = 0;
      let currentExpense = 0;
      let currentInvestment = 0;
      let currentSaves = 0;
      transactions.forEach((transaction) => {
        switch (transaction.type) {
          case "Income":
            currentIncome += transaction.amount;
            currentSaves += transaction.amount; // Increment totalSaves for Income
            break;
          case "Expense":
            currentExpense += transaction.amount;
            currentSaves -= transaction.amount; // Decrement totalSaves for Expense
            break;
          case "Investment":
            currentInvestment += transaction.amount;
            currentSaves -= transaction.amount; // Decrement totalSaves for Investment
            break;
          default:
            break;
        }
      });
      const currentMonthData = {
        totalIncome: currentIncome,
        totalExpense: currentExpense,
        totalInvestment: currentInvestment,
        totalSaves: currentSaves,
      };
      console.log("Current month data in cron:", currentMonthData);
      // Add the current data to the MonthlyCompare model
      const monthlyCompare = new MonthlyCompare(currentMonthData);
      if (!monthlyCompare) {
        console.log("No monthly data found");
      } else {
        await monthlyCompare.save();
        console.log("Monthly data saved to MonthlyCompare model");
      }
    } else {
      console.log("Not the start of a new month.");
    }
    console.log("Task Finished...");
  } catch (error) {
    console.error("Error updating MonthlyCompare model:", error);
  }
});

// -----------------------------------------------------------------------------------------------------------------------------
// cron.schedule("*/1 * * * *", async () => {
//   try {
//     const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
//     const transactions = await Transaction.find({
//       createdAt: {
//         $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
//         $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
//       },
//     });
//     const TOKEN_PATH = transactions;
//     const credentials = {
//       client_id: process.env.GOOGLE_CLIENT_ID,
//       client_secret: process.env.GOOGLE_CLIENT_SECRET,
//       redirect_uris: [process.env.GOOGLE_REDIRECT_URI],
//     };

//     //  Create an OAuth2 client with the given credentials
//     const { client_id, client_secret, redirect_uris } = credentials;
//     const oAuth2Client = new google.auth.OAuth2(
//       client_id,
//       client_secret,
//       redirect_uris[0]
//     );

//     // Function to get the authorization URL
//     function getAuthUrl() {
//       return oAuth2Client.generateAuthUrl({
//         access_type: "offline",
//         scope: SCOPES,
//       });
//     }

//     // Function to get the access token
//     async function getAccessToken(code) {
//       const { tokens } = await oAuth2Client.getToken(code);
//       oAuth2Client.setCredentials(tokens);
//       await writeFileAsync(TOKEN_PATH, JSON.stringify(tokens));
//       console.log("Token stored to", TOKEN_PATH);
//       return oAuth2Client;
//     }

//     // Function to check if a token file exists
//     async function checkTokenFile() {
//       try {
//         await readFileAsync(TOKEN_PATH);
//         return true;
//       } catch (err) {
//         return false;
//       }
//     }

//     // Example usage
//     async function runExample() {
//       try {
//         // Check if token file exists
//         const tokenFileExists = await checkTokenFile();

//         if (!tokenFileExists) {
//           // If no token file, get authorization URL
//           const authUrl = getAuthUrl();
//           console.log("Authorize this app by visiting this URL:", authUrl);

//           // Prompt user to enter the authorization code
//           const rl = readline.createInterface({
//             input: process.stdin,
//             output: process.stdout,
//           });

//           const code = await rl.questionAsync(
//             "Enter the code from that page here: "
//           );
//           rl.close();

//           // Get access token
//           await getAccessToken(code);
//         } else {
//           // If token file exists, set credentials from the file
//           const tokenContent = await readFileAsync(TOKEN_PATH);
//           const tokens = JSON.parse(tokenContent);
//           oAuth2Client.setCredentials(tokens);
//         }

//         // Now you can use `oAuth2Client` to make authorized API requests
//         // For example, list files in Google Drive
//         const drive = google.drive({ version: "v3", auth: oAuth2Client });
//         const files = await drive.files.list({
//           pageSize: 10,
//           fields: "nextPageToken, files(id, name)",
//         });

//         console.log("Files:");
//         files.data.files.forEach((file) => {
//           console.log(`${file.name} (${file.id})`);
//         });
//       } catch (err) {
//         console.error("Error:", err.message);
//       }
//     }
//     runExample();
//   } catch (error) {
//     console.error("Error:", error);
//   }
// });

// -----------------------------------------------------------------------------------------------------------------------------

app.get("*.css", (req, res, next) => {
  res.contentType("text/css");
  next();
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on Port ${process.env.PORT}`);
});

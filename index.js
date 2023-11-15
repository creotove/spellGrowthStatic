require("dotenv").config();
const express = require("express");
const path = require("path");
const { connectDb } = require("./config/db.js");
const morgan = require("morgan");
const cron = require("node-cron");
const fs = require("fs");
const Employee = require("./models/Employee.js");
const cors = require("cors");

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
cron.schedule("0 0 1 * *", async () => {
  try {
    // Set salary status to 'remaining' for all employees
    await Employee.updateMany({}, { $set: { salaryStatus: "Pending" } });

    console.log('Salary status reset to "remaining" at the end of the month.');
  } catch (error) {
    console.error("Error resetting salary status:", error);
  }
});

app.get("*.css", (req, res, next) => {
  res.contentType("text/css");
  next();
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on Port ${process.env.PORT}`);
});

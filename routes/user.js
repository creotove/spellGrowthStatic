const express = require("express");
const upload = require("../middlewares/multer.js");
const cron = require("node-cron");
const router = express.Router();
const {
  login,
  signup,
  addEmployee,
  addClient,
  getEmployee,
  getClient,
  getAsset,
  getExpense,
  addExpense,
  getRefer,
  addInvoice,
  getInvoice,
  getInvoiceLength,
  workNotAlloted,
  allotWork,
  changeStatus,
  pendingSalary,
  giveSalary,
  getTransaction,
  getCurrentAmount,
  getTransactionForBoxes,
  addInvestment,
  addIncome,
  getIncome,
  getReports,
  compare,
  giveAdvanceSalary,
} = require("../controllers/user");
const { authUser } = require("../middlewares/auth");
const User = require("../models/User");
const { uploadMiddleWare } = require("../middlewares/cloudinary.js");
const MonthlyCompare = require("../models/MonthlyCompare.js");
const Transaction = require("../models/Transaction.js");

// POST || Add User || Only one user is addd for the first Time
router.post("/addUser", signup);

//POST || Login User
router.post("/login", login);

//POST || Get Loggedin User Info
router.post("/getUser", authUser, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        message: "user not found in auth controller",
        success: false,
      });
    }
    user.password = undefined;
    return res.status(200).send({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

//POST || Add Employee
router.post(
  "/addEmployee",
  upload.single("pic"),
  uploadMiddleWare,
  addEmployee
);

//POST || Add Client
router.post("/addClient", upload.single("pic"), uploadMiddleWare, addClient);

// POST || Add Invoice
router.post("/addInvoice", addInvoice);

//POST || Add Expense
router.post("/addExpense", addExpense);

//POST || Add Investment
router.post("/addInvestment", addInvestment);

//POST || Add Income
router.post("/addIncome", addIncome);

//GET || Fetch Current Amount
router.get("/currentAmount", getCurrentAmount);

//GET || Fetch Transaction for Boxes
router.get("/getTransactionForBoxes", getTransactionForBoxes);

//GET || Fetch All Employee as well as a single employee
router.get("/employees", getEmployee);

//GET || Fetch All Clients as well as a single client
router.get("/clients", getClient);

//GET || Fetch All Invoices Default is Pending
router.get("/invoices", getInvoice);

//GET || Fetch All Assets
router.get("/assets", getAsset);

//GET || Fetch All Income
router.get("/incomes", getIncome);

//GET || Fetch All Expenses
router.get("/expenses", getExpense);

//GET || Fetch All Transactions of month
router.get("/reports", getReports);

//GET || Fetch All Transactions
router.get("/transactions", getTransaction);

//GET || Fetch All Referals
router.get("/refer", getRefer);

//GET || Invoice Length
router.get("/invoiceLength", getInvoiceLength);

//GET || Client whoose work is not alloted yet
router.get("/workNotAlloted", workNotAlloted);

//GET || Fetch All Employees to be paid at the start of the month
router.get("/pendingSalary", pendingSalary);

//Patch || Allot work to the employee
router.patch("/allotWork", allotWork);

//PATCH || Change Status of Invoice
router.patch("/changeStatus", changeStatus);

//PATCH || Paying Salary to Employee
router.patch("/giveSalary", giveSalary);

//PATCH || Paying advance salary to Employee
router.patch("/giveAdvanceSalary", giveAdvanceSalary);



//Try
router.post(
  "/uploadCloudinary",
  upload.single("image"),
  uploadMiddleWare,
  async (req, res) => {
    res.status(200).json({
      success: true,
      data: req.body,
    });
  }
);

// router.post('/monthlyCompare', monthlyCompare)
router.post("/compare", compare);
router.post("/compareAndUpdate", async (req, res) => {
  try {
    // Fetch the current month's transactions
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
    // Calculate percentage changes
    const percentageChanges = calculatePercentageChanges(
      previousData,
      currentMonthData
    );

    // Update the MonthlyCompare model with the current month's data
    await MonthlyCompare.findOneAndUpdate(
      {
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      currentMonthData,
      { upsert: true } // Create a new document if not found
    );

    return res.status(200).json({
      success: true,
      message: "Comparison and update successful",
      data: percentageChanges,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
  console.log(result);
  return result;
}

// Helper function to calculate percentage changes
function calculatePercentageChanges(previousData, currentData) {
  const percentageChanges = {};
  console.log(previousData,249);
  console.log(currentData,250);

  for (const category in currentData) {
    if (currentData.hasOwnProperty(category)) {
      const percentageChange =
        ((currentData[category] - previousData[category]) /
          Math.abs(previousData[category] || 1)) *
        100;
      percentageChanges[category] = percentageChange;
    }
  }
  return percentageChanges;
}

// Schedule the task to run on the first day of every month at midnight

module.exports = router;

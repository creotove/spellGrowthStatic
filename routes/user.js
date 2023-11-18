const express = require("express");
const upload = require("../middlewares/multer.js");
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
  compare,
} = require("../controllers/user");
const { authUser } = require("../middlewares/auth");
const User = require("../models/User");
const { uploadMiddleWare } = require("../middlewares/cloudinary.js");

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
router.get("/currentAmount",getCurrentAmount)

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
router.post('/compare', compare)
module.exports = router;

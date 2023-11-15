const User = require("../models/User");
const Employee = require("../models/Employee");
const Client = require("../models/Client");
const Expense = require("../models/Expense");
const Asset = require("../models/Asset");
const Invoice = require("../models/Invoice");
const Transaction = require("../models/Transaction");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const { email, password } = req.body;
  const salt = await bcrypt.genSalt(5);
  const saltedPass = await bcrypt.hash(password, salt);
  const data = {
    email,
    password: saltedPass,
  };
  const newUser = await User.add(data);
  if (!newUser) {
    return res.status(400).send({
      success: false,
      message: "Can not add the user",
    });
  }
  return res.status(201).send({
    success: true,
    message: "User addd successfully",
  });
};
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send({
      success: false,
      message: "No user found",
    });
  }
  if (!email) {
    return res.status(404).send({
      success: false,
      message: "User Not Found",
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send({
      success: false,
      message: "Invalid credentials",
    });
  }
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return res.status(200).send({
    success: true,
    message: "Logged In successfully",
    data: token,
  });
};
const addEmployee = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      qual,
      expertize,
      exp,
      salary,
      governmentIdName,
      governmentIdNumber,
      pic,
      address,
      bankName,
      ifscCode,
      payPal,
    } = req.body;
    const data = {
      name,
      mobile,
      email,
      qual,
      expertize,
      exp,
      salary,
      govProof: { name: governmentIdName, number: governmentIdNumber },
      pic,
      address,
      bankName,
      ifscCode,
      payPal,
    };
    const newEmployee = await Employee.create(data);
    if (!newEmployee) {
      return res.status(400).send({
        message: "Cannot create employee",
        success: false,
      });
    }
    return res.status(201).send({
      message: "Employee created successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};
const addClient = async (req, res) => {
  try {
    const {
      fullName,
      clientId,
      businessName,
      mobile,
      email,
      city,
      state,
      service,
      serviceDuration,
      websiteUrl,
      instagramUrl,
      amount,
      pic,
      refer,
    } = req.body;
    const data = {
      name: fullName,
      clientId,
      businessName,
      mobile,
      email,
      city,
      state,
      service,
      serviceDuration,
      websiteUrl,
      instagramUrl,
      amount,
      pic,
      refer,
    };
    const existingClint = await Client.findOne({ clientId });
    if (existingClint) {
      return res.status(400).send({
        message: "Client already exists",
        success: false,
      });
    }
    const newClient = await Client.create(data);
    if (!newClient) {
      return res.status(400).send({
        message: "Cannot create client",
        success: false,
      });
    }
    return res.status(201).send({
      message: "Client created successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};
const addInvoice = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      todayDate,
      dueDate,
      invoiceId,
      totalAmount,
      advanceAmount,
      serviceArrary,
      paymentMethod,
    } = req.body;
    const data = {
      name,
      phone,
      email,
      invoiceId,
      todayDate,
      dueDate,
      totalAmount,
      advanceAmount,
      services: serviceArrary,
      paymentMethod,
    };
    const newInvoice = await Invoice.create(data);
    const { remainingBalance } = await Transaction.findOne(
      {},
      {},
      { sort: { created_at: -1 } }
    ).select("remainingBalance -_id");
    const newTransaction = await Transaction.create({
      name,
      amount: advanceAmount,
      type: "Income",
      description: "Advance amount of client",
      remainingBalance: remainingBalance + advanceAmount,
    });
    const addIncome = await Asset.create({
      name,
      amount: advanceAmount,
      date: new Date(),
    });
    if (!addIncome) {
      return res.status(400).send({
        message: "Cannot create asset",
        success: false,
      });
    }
    if (!newTransaction) {
      return res.status(400).send({
        message: "Cannot create transaction",
        success: false,
      });
    }
    if (!newInvoice) {
      return res.status(400).send({
        message: "Cannot create invoice",
        success: false,
      });
    }
    await newInvoice.save();
    await newTransaction.save();
    await addIncome.save();
    return res.status(201).send({
      message: "Invoice created successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};
const addExpense = async (req, res) => {
  try {
    const { name, amount, date } = req.body;
    const data = {
      name,
      amount,
      date,
    };
    const newExpense = await Expense.create(data);
    const { remainingBalance } = await Transaction.findOne(
      {},
      {},
      { sort: { created_at: -1 } }
    ).select("remainingBalance -_id");
    const newTransaction = await Transaction.create({
      name,
      amount,
      type: "Expense",
      description: `Bought ${name}`,
      remainingBalance: remainingBalance - amount,
    });

    if (!newTransaction) {
      return res.status(400).send({
        message: "Cannot create transaction",
        success: false,
      });
    }
    if (!newExpense) {
      return res.status(400).send({
        message: "Cannot create expense",
        success: false,
      });
    }
    await newExpense.save();
    await newTransaction.save();
    return res.status(201).send({
      success: true,
      message: "Expense Added Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};
const addAsset = async (req, res) => {
  try {
    const { name, amount, date } = req.body;
    const data = {
      name,
      amount,
      date,
    };
    const newAsset = await Asset.create(data);
    const { remainingBalance } = await Transaction.findOne(
      {},
      {},
      { sort: { created_at: -1 } }
    ).select("remainingBalance -_id");
    const newTransaction = await Transaction.create({
      name,
      amount,
      type: "Investment",
      description: `Bought ${name}`,
      remainingBalance: remainingBalance - amount,
    });

    if (!newTransaction) {
      return res.status(400).send({
        success: false,
        message: "Cannot create transaction",
      });
    }
    if (!newAsset) {
      return res.status(400).send({
        success: false,
        message: "Cannot create asset",
      });
    }
    await newAsset.save();
    await newTransaction.save();
    return res.status(201).send({
      success: true,
      message: "Asset Added Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};
const getEmployee = async (req, res) => {
  try {
    if (req.query?.search) {
      console.log("in not query search");
      const employeeId = req.query.search;
      const name = req.query.search;
      const employeeIds = await Employee.find({ employeeId });
      const employeeNames = await Employee.find({ name });
      if (employeeIds.length === 0 || employeeNames.length === 0) {
        return res.status(404).send({
          success: false,
          message: "No employee found",
        });
      }
      const data = employeeIds || employeeNames;
      return res.status(200).send({
        success: true,
        message: "Employee found successfully",
        data: data,
      });
    }
    const employees = await Employee.find({});
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    results.totalCount = employees.length;
    results.totalPages = Math.ceil(employees.length / limit) || 0;
    if (endIndex < employees.length) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    results.results = employees.slice(startIndex, endIndex);

    return res.status(200).send({
      data: results,
      success: true,
      message: "Employees Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server Error",
    });
  }
};
const getClient = async (req, res) => {
  try {
    if (req.query?.search) {
      console.log("in not query search");
      const clientId = req.query.search;
      const name = req.query.search;
      const clientIds = await Client.find({ clientId });
      const clientNames = await Client.find({ name });
      if (clientIds.length === 0 || clientNames.length === 0) {
        return res.status(404).send({
          success: false,
          message: "No client found",
        });
      }
      const data = clientIds || clientNames;
      return res.status(200).send({
        success: true,
        message: "Client found successfully",
        data: data,
      });
    }
    if (req.query.refer) {
      const refer = req.query.refer;
      const client = await Client.findOne({ clientId: refer });
      if (!client) {
        return res.status(200).send({
          success: false,
          message: "No client found",
        });
      }
      return res.status(200).send({
        success: true,
        message: "Client found successfully",
        // data: clients,
      });
    }
    if (req.query?.limited) {
      const limit = parseInt(req.query.limit);
      const clients = await Client.find({})
        .limit(limit)
        .select("pic name businessName serviceDuration -_id");
      return res.status(200).send({
        data: clients,
        success: true,
        message: "Clietns Fetched Successfully",
      });
    }

    const clients = await Client.find({});
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    results.totalCount = clients.length;
    results.totalPages = Math.ceil(clients.length / limit);
    if (endIndex < clients.length) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    results.results = clients.slice(startIndex, endIndex);

    return res.status(200).send({
      data: results,
      success: true,
      message: "Clietns Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server Error",
    });
  }
};
const getInvoice = async (req, res) => {
  try {
    const { status } = req.query;
    const invoices = await Invoice.find({ status });
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    results.totalCount = invoices.length;
    results.totalPages = Math.ceil(invoices.length / limit);
    if (endIndex < invoices.length) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    results.results = invoices.slice(startIndex, endIndex);

    return res.status(200).send({
      data: results,
      success: true,
      message: "Invoices Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server Error",
    });
  }
};
const getExpense = async (req, res) => {
  try {
    const expenses = await Expense.find({});
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    results.totalCount = expenses.length;
    results.totalPages = Math.ceil(expenses.length / limit);
    if (endIndex < expenses.length) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    results.results = expenses.slice(startIndex, endIndex);

    return res.status(200).send({
      data: results,
      success: true,
      message: "Expenses Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server Error",
    });
  }
};
const getTransaction = async (req, res) => {
  try {
    if (req.query?.limited) {
      const limited = parseInt(req.query.limited);
      const transactions = await Transaction.find({})
        .sort({ createdAt: -1 })
        .limit(limited);
      return res.status(200).send({
        data: transactions,
        success: true,
        message: "Expenses Fetched Successfully",
      });
    }

    const transactions = await Transaction.find({}).sort({ createdAt: -1 });
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    results.totalCount = transactions.length;
    results.totalPages = Math.ceil(transactions.length / limit);
    if (endIndex < transactions.length) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    results.results = transactions.slice(startIndex, endIndex);

    return res.status(200).send({
      data: results,
      success: true,
      message: "Expenses Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server Error",
    });
  }
};
const getCurrentAmount = async (req, res) => {
  try {
    const { remainingBalance, amount, type } = await Transaction.findOne(
      {},
      {},
      { sort: { createdAt: -1 } }
    ).select("-_id");
    return res.status(200).send({
      success: true,
      message: "Current Amount fetched successfully",
      data: { remainingBalance, amount, type },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server Error",
    });
  }
};
const getTransactionForBoxes = async (req, res) => {
  try {
    // const assets = await Asset.find({});
    // const investment = await Transaction.find({ type: "Investment" });
    const invoices = await Invoice.find({status:"Pending"}).select("totalAmount -_id");
    const income = await Transaction.find({ type: "Income" });
    const expenses = await Expense.find({});

    const upcoming = invoices.reduce((acc, curr) => {
      return acc + curr.totalAmount;
    }, 0);
    const incomeAmount = income.reduce((acc, curr) => {
      return acc + curr.amount;
    }, 0);
    const expenseAmount = expenses.reduce((acc, curr) => {
      return acc + curr.amount;
    }, 0);
    const currentAmount = incomeAmount - expenseAmount;
    const data = {
      upcoming,
      incomeAmount,
      expenseAmount,
      currentAmount,
    };

    return res.status(200).send({
      success: true,
      message: "Current Amount fetched successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server Error",
    });
  }
};

const getAsset = async (req, res) => {
  try {
    const assets = await Asset.find({});
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    results.totalCount = assets.length;
    results.totalPages = Math.ceil(assets.length / limit);
    if (endIndex < assets.length) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    results.results = assets.slice(startIndex, endIndex);

    return res.status(200).send({
      data: results,
      success: true,
      message: "Expenses Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server Error",
    });
  }
};
const getRefer = async (req, res) => {
  try {
    const { refer } = req.query;
    console.log(refer);
    const clients = await Client.find({}).select("clientId -_id");
    const client = clients.clientId.includes(refer);
    console.log(client);
    if (!exists) {
      return res.status(404).send({
        success: false,
        message: "No client found",
      });
    }
    if (clients.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No client found",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Client found successfully",
      data: client,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server Error",
    });
  }
};
const getInvoiceLength = async (req, res) => {
  try {
    const invoices = await Invoice.find({});
    const length = invoices.length;
    return res.status(200).send({
      success: true,
      message: "Invoice length fetched successfully",
      data: length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};
const workNotAlloted = async (req, res) => {
  try {
    const work = await Client.find({ allotedWork: false });
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    results.totalCount = work.length;
    results.totalPages = Math.ceil(work.length / limit);
    if (endIndex < work.length) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    results.results = work.slice(startIndex, endIndex);

    return res.status(200).send({
      data: results,
      success: true,
      message: "Expenses Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};
const allotWork = async (req, res) => {
  try {
    const { employeeId, clientId } = req.body;
    const allot = await Client.findOneAndUpdate(
      { clientId },
      { $set: { allotedTo: employeeId, allotedWork: true } }
    );
    if (!allot) {
      return res.status(400).send({
        message: "Cannot create transaction",
        success: false,
      });
    }
    return res.status(200).send({
      success: true,
      message: "Work alloted Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};
const changeStatus = async (req, res) => {
  try {
    const _id = req.query.id;

    const invoice = await Invoice.findByIdAndUpdate(
      { _id },
      { $set: { status: "Paid" } },
      { new: true }
    );
    if (!invoice) {
      return res.status(404).send({
        success: false,
        message: "Invoice not found",
      });
    }
    const { remainingBalance } = await Transaction.findOne(
      {},
      {},
      { sort: { created_at: -1 } }
    ).select("remainingBalance -_id");
    const newTransaction = await Transaction.create({
      name: invoice.name,
      amount: invoice.totalAmount,
      type: "Income",
      description: `Paid by ${invoice.name}`,
      remainingBalance: remainingBalance + invoice.totalAmount,
    });
    if (!newTransaction) {
      return res.status(400).send({
        message: "Cannot create transaction",
        success: false,
      });
    }
    await newTransaction.save();
    await invoice.save();

    return res.status(200).send({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};
const pendingSalary = async (req, res) => {
  try {
    if (req.query?.status) {
      const { status } = req.query;
      const employees = await Employee.find({ salaryStatus: status })
        .select("name salaryStatus salary pic name expertize ")
        .sort({ createdAt: -1 });
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const results = {};
      results.totalCount = employees.length;
      results.totalPages = Math.ceil(employees.length / limit);
      if (endIndex < employees.length) {
        results.next = {
          page: page + 1,
          limit: limit,
        };
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit,
        };
      }
      results.results = employees.slice(startIndex, endIndex);

      return res.status(200).send({
        data: results,
        success: true,
        message: "Invoices Fetched Successfully",
      });
    }
    // Check if it's the start of the month (day 1)
    const currentDate = new Date();
    const isStartOfMonth = currentDate.getDate() <= 20;

    if (isStartOfMonth) {
      // Fetch employees with salary status 'remaining'
      const employees = await Employee.find({ salaryStatus: "Pending" }).select(
        "name salaryStatus salary pic name expertize "
      );
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const results = {};
      results.totalCount = employees.length;
      results.totalPages = Math.ceil(employees.length / limit);
      if (endIndex < employees.length) {
        results.next = {
          page: page + 1,
          limit: limit,
        };
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit,
        };
      }
      results.results = employees.slice(startIndex, endIndex);

      return res.status(200).send({
        data: results,
        success: true,
        message: "Invoices Fetched Successfully",
      });
    } else {
      res
        .status(200)
        .send({ message: "Not the start of the month.", succes: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const giveSalary = async (req, res) => {
  try {
    const { id } = req.query;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).send({
        success: false,
        message: "Employee not found",
      });
    }
    const { remainingBalance } = await Transaction.findOne(
      {},
      {},
      { sort: { createdAt: -1 } }
    ).select("-_id");
    const newTransaction = await Transaction.create({
      name: "Salary",
      amount: employee.salary,
      type: "Expense",
      description: `Salary to ${employee.name}`,
      remainingBalance: remainingBalance - employee.salary,
    });
    const addExpense = await Expense.create({
      name: "Salary",
      amount: employee.salary,
      date: new Date(),
    });

    if (!addExpense) {
      return res.status(400).send({
        message: "Cannot create expense",
        success: false,
      });
    }

    if (!newTransaction) {
      return res.status(400).send({
        message: "Cannot create transaction",
        success: false,
      });
    }
    await newTransaction.save();
    employee.salaryStatus = "Paid";
    await employee.save();
    await addExpense.save();
    return res.status(200).send({
      success: true,
      message: "Salary paid successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};
module.exports = {
  login,
  signup,
  addEmployee,
  addClient,
  addInvoice,
  getEmployee,
  getClient,
  getInvoice,
  addExpense,
  addAsset,
  getExpense,
  getAsset,
  getRefer,
  getInvoiceLength,
  workNotAlloted,
  allotWork,
  changeStatus,
  pendingSalary,
  giveSalary,
  getTransaction,
  getCurrentAmount,
  getTransactionForBoxes,
};

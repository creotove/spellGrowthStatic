const User = require("../models/User");
const Employee = require("../models/Employee");
const Client = require("../models/Client");
const Expense = require("../models/Expense");
const Asset = require("../models/Asset");
const Invoice = require("../models/Invoice");
const Transaction = require("../models/Transaction");

const paginated = async (req, res, collectionName, query) => {
  try {
    const data = await collectionName.find(query);
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    results.totalCount = data.length;
    results.totalPages = Math.ceil(data.length / limit);
    if (endIndex < data.length) {
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
    results.results = data.slice(startIndex, endIndex);

    return res.status(200).send({
      data: results,
      success: true,
      message: `${collectionName}s Fetched Successfully`,
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

module.exports = { paginated };

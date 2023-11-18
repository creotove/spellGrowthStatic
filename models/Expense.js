const mongoose = require("mongoose");
const expenseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name of expense is required"],
    },
    description: {
      type: String,
      required: [true, "Description of expense is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount of expense is required"],
    },
  },
  { timestamps: true }
);
const Expense = mongoose.model("expense", expenseSchema);
module.exports = Expense;

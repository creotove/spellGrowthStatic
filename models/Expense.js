const mongoose = require("mongoose");
const expenseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name of asset is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount of asset is required"],
    },
  },
  { timestamps: true }
);
const Expense = mongoose.model("expense", expenseSchema);
module.exports = Expense;

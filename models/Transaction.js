const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name of transaction is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount of transaction is required"],
    },
    type: {
      type: String,
      enum: ["Income", "Expense", "Investment"],
    },
    description: {
      type: String,
      required: [true, "Description of transaction is required"],
    },
    remainingBalance: {
      type: Number,
      required: [true, "Remaining Balance of transaction is required"],
    },
  },
  { timestamps: true }
);
const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;

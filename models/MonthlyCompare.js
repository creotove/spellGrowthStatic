const mongoose = require("mongoose");
const monthlyCompareSchema = new mongoose.Schema(
  {
    totalIncome: {
      type: Number,
      required: [true, "Total Income is required"],
    },
    totalExpense: {
      type: Number,
      required: [true, "Total Expense is required"],
    },
    totalSaves: {
      type: Number,
      required: [true, "Total Savings is required"],
    },
    totalInvestment: {
      type: Number,
      required: [true, "Total Investment is required"],
    },
  },
  { timestamps: true }
);

const MonthlyCompare = mongoose.model("monthly", monthlyCompareSchema);
module.exports = MonthlyCompare;

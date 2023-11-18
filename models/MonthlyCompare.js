const mongoose = require("mongoose");
const monthlyCompareSchema = new mongoose.Schema(
  {
    totalIncomeCurrent: {
      type: Number,
      required: [true, "Name of client is required"],
    },
    totalIncomePrevious: {
      type: Number,
      required: [true, "Client id is required"],
    },
    totalExpenseCurrent: {
      type: Number,
      required: [true, "Name of bussiness is required"],
    },
    totalExpensePrevious: {
      type: Number,
      required: [true, "Mobile number of client is required"],
    },
    totalSavesCurrent: {
      type: Number,
      required: [true, "Email of client is required"],
    },
    totalSavesPrevious: {
      type: Number,
      required: [true, "City of client is required"],
    },
    totalInvestmentCurrent: {
      type: Number,
      required: [true, "State of client is required"],
    },
    totalInvestmentPrevious: {
      type: Number,
      required: [true, "State of client is required"],
    },
    totalUpcomingCurrent: {
      type: Number,
      required: [true, "State of client is required"],
    },
    totalUpcomingPrevious: {
      type: Number,
      required: [true, "State of client is required"],
    },
  },
  { timestamps: true }
);

const MonthlyCompare = mongoose.model("monthly", monthlyCompareSchema);
module.exports = MonthlyCompare;

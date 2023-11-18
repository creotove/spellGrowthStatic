const mongoose = require("mongoose");
const incomeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name of income is required"],
    },
    description: {
        type: String,
        required: [true, "Description of income is required"],
      },
    amount: {
      type: Number,
      required: [true, "Amount of income is required"],
    },
  },
  { timestamps: true }
);
const Income = mongoose.model("income",incomeSchema)
module.exports = Income

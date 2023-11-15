const mongoose = require("mongoose");
const assetSchema = new mongoose.Schema(
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
const Asset = mongoose.model("asset",assetSchema)
module.exports = Asset

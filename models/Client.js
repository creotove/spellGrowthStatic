const mongoose = require("mongoose");
const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name of client is required"],
    },
    clientId: {
      type: String,
      required: [true, "Client id is required"],
      unique: true,
    },

    businessName: {
      type: String,
      required: [true, "Name of bussiness is required"],
    },
    mobile: {
      type: Number,
      required: [true, "Mobile number of client is required"],
    },
    email: {
      type: String,
      required: [true, "Email of client is required"],
    },
    city: {
      type: String,
      required: [true, "City of client is required"],
    },
    state: {
      type: String,
      required: [true, "State of client is required"],
    },
    websiteUrl: {
      type: String,
      default: "N/A",
    },
    instagramUrl: {
      type: String,
      default: "N/A",
    },
    invoices: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "invoice",
      },
    ],
    pic: {
      type: String,
      required: [true, "Profile Pic is required"],
    },
    referedBy: {
      type: String,
      default: "N/A",
    },
    referenced: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "client",
      },
    ],
    commission: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Client = mongoose.model("client", clientSchema);
module.exports = Client;

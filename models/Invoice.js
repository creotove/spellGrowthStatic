const mongoose = require("mongoose");
const invoiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name of client is required"],
    },
    phone: {
      type: Number,
      required: [true, "Phone number of client is required"],
    },
    email: {
      type: String,
      required: [true, "Email of client is required"],
    },
    invoiceNumber: {
      type: String,
      required: [true, "Invoice Number is required"],
    },
    dueDate: {
      type: String,
      required: [true, "Due Date is required"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Amount of invoice is required"],
    },
    advanceAmount: {
      type: Number,
      required: [true, "Advance Amount of invoice is required"],
    },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
    services: [
      {
        description: {
          type: String,
          required: [true, "Description of service is required"],
        },
        subDescription: {
          type: String,
          required: [true, "Sub description of service is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity of service is required"],
        },
        serviceAmount: {
          type: Number,
          required: [true, "Amount of service is required"],
        },
      },
    ],
    paymentMethod: {
      type: String,
      enum: ["Cash", "Cheque", "Online"],
      default: "Cash",
    },
  },
  { timestamps: true }
);
const Invoice = mongoose.model("invoice", invoiceSchema);
module.exports = Invoice;

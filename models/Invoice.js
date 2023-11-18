const mongoose = require("mongoose");
const invoiceSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      ref: "client",
    },
    client_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "client",
    },
    invoiceNumber: {
      type: String,
      required: [true, "Invoice Number is required"],
    },
    addedDate: {
      type: String,
      required: [true, "Due Date is required"],
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
    serviceDuration: {
      type: String,
      enum: ["Yearly", "Monthly", "One Time"],
      required: [true, "Service duration of client service is required"],
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
    onlinePaymentMethod: {
      type: String,
      default: "No Online Payment",
    },
    //
    allotedWork: {
      type: String,
      enum: [true, false],
      default: false,
    },
    allotedTo: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "employee",
    },
    //
    serviceStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
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

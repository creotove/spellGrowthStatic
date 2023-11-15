const mongoose = require("mongoose");
const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  mobile: {
    type: Number,
    required: [true, "Mobile number is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  qual: {
    type: String,
    required: [true, "Qualification is required"],
  },
  expertize: {
    type: String,
    required: [true, "Expertize is required"],
  },
  exp: {
    type: String,
    required: [true, "Exp is required"],
  },
  salary: {
    type: Number,
    required: [true, "Salary is required"],
  },
  govProof: {
    name: {
      type: String,
      required: [true, "Government proof is required"],
    },
    number: {
      type: Number,
      required: [true, "Number is required"],
    },
  },
  advanceSalary: {
    type: Number,
    default: 0,
  },
  salaryStatus: {
    type: String,
    enum: ["Paid", "Pending"],
    default: "Pending",
  },
  pic: {
    type: String,
    required: [true, "Profile Pic is required"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
 
  bankName: {
    type: String,
    default: "N/A",
  },
  ifscCode: {
    type: String,
    default: "N/A",
  },
  payPal: {
    type: String,
    default: "N/A",
  },
});

const Employee = mongoose.model("employee", employeeSchema);
module.exports = Employee;

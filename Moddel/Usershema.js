const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
  },
  newpassword: {
    type: String,
  },

  verification: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["admin", "customer", "vendor"],
    default: "customer",
  },
  status: {
    type: String,
    enum: ["active", "blocked", "pending"],
    default: "active",
  },
  otp: String,
  otpExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model("UserList", userSchema);

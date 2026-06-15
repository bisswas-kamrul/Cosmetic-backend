const express = require("express");
const PaymentContollar = require("../controllersFloder/PaymentController");
const protect = require("../middlewareFloder/authMiddleware");
const Paymentrouter = express.Router();


Paymentrouter.post("/payment", protect, PaymentContollar)

module.exports = Paymentrouter;

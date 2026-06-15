const express = require("express");
const OrderController = require("../controllersFloder/OrderController");
const GetAllOrdersContollar = require("../controllersFloder/GetAllOrdersContollar");
const updeteorderContollar = require("../controllersFloder/updeteorderContollar");
const deleteorderContollar = require("../controllersFloder/deleteorderContollar");
const protect = require("../middlewareFloder/authMiddleware");
const admin = require("../middlewareFloder/admin");
const customerMyorderController = require("../controllersFloder/customerMyorderController");
const VendorOrderContollar = require("../controllersFloder/VendorOrderContollar");
const verifyVendor = require("../middlewareFloder/verifyVendor");
const UpdateVendorOrderStatusController = require("../controllersFloder/UpdateVendorOrderStatusController");

const Odearrouter = express.Router();

Odearrouter.post("/Checkout", protect, OrderController);

Odearrouter.get("/AllOdearShow", protect, admin, GetAllOrdersContollar);

Odearrouter.put(
  "/UpdeteProductorder/:id",
  protect,
  admin,
  updeteorderContollar,
);

Odearrouter.delete("/deleteOrder/:id", protect, admin, deleteorderContollar);

Odearrouter.get("/My-Order", protect, customerMyorderController);

Odearrouter.get("/Vendor-Orders", protect, verifyVendor, VendorOrderContollar);
Odearrouter.put("/Vendor-Orders/:id/status", protect, verifyVendor, UpdateVendorOrderStatusController);

module.exports = Odearrouter;

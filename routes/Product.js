const express = require("express");
const multer = require("multer");
const productContollar = require("../controllersFloder/productContollar");
const ProductGetContollar = require("../controllersFloder/ProductGetContollar");
const upload = require("../middlewareFloder/imgupload");
const ProductUpdetecontollar = require("../controllersFloder/ProductUpdetecontollar");
const DeleteProductContollar = require("../controllersFloder/DeleteProductContollar");
const singleproductContollar = require("../controllersFloder/singleproductContollar");
const couponContollar = require("../controllersFloder/couponContollar");
const ShowCouponContollar = require("../controllersFloder/ShowCouponContollar");
const CreactCouponContollar = require("../controllersFloder/CreactCouponContollar");
const DeleteCouponContollar = require("../controllersFloder/DeleteCouponContollar");
const OfferCouponsContollar = require("../controllersFloder/OfferCouponsContollar");
const MyProductsContollar = require("../controllersFloder/MyProductsContollar");
const protect = require("../middlewareFloder/authMiddleware");
const verifyVendor = require("../middlewareFloder/verifyVendor");
const admin = require("../middlewareFloder/admin");

const Productrouter = express.Router();

Productrouter.post(
  "/create",
  protect,
  verifyVendor,
  upload.single("image"),
  productContollar,
);
Productrouter.get("/ShowProduct", ProductGetContollar);
Productrouter.get("/singleproduct/:id", singleproductContollar);
Productrouter.put(
  "/UpdateCreate/:id",
  protect, verifyVendor,
  upload.single("image"),
  ProductUpdetecontollar,
);
Productrouter.delete("/DeleteProduct/:id", protect, verifyVendor, DeleteProductContollar);
Productrouter.post("/Apply-Coupon", couponContollar);
Productrouter.post("/Creact-Coupon", protect, admin, CreactCouponContollar);
Productrouter.get("/Show-Coupon", ShowCouponContollar);
Productrouter.get("/Offer-Show", OfferCouponsContollar);
Productrouter.delete("/Delete-Coupon/:id", protect, admin, DeleteCouponContollar);
Productrouter.get("/my-products", protect, verifyVendor, MyProductsContollar);

module.exports = Productrouter;

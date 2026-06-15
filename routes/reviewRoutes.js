const express = require("express");
const protect = require("../middlewareFloder/authMiddleware");
const admin = require("../middlewareFloder/admin");
const {
  getProductReviews,
  createProductReview,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
} = require("../controllersFloder/reviewContollar");

const reviewRouter = express.Router();

reviewRouter.get("/products/:productId/reviews", getProductReviews);
reviewRouter.post("/products/:productId/reviews", protect, createProductReview);
reviewRouter.get("/reviews", protect, admin, getAllReviews);
reviewRouter.put("/reviews/:id/status", protect, admin, updateReviewStatus);
reviewRouter.delete("/reviews/:id", protect, admin, deleteReview);

module.exports = reviewRouter;

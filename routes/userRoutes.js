const express = require("express");
const loginUser = require("../controllersFloder/loginUsercontollar");
const SingupController = require("../controllersFloder/SingupController");
const UserContollar = require("../controllersFloder/UserContollar");
const protect = require("../middlewareFloder/authMiddleware");
const profileController = require("../controllersFloder/profileController");
const {
  updateProfileController,
  changePasswordController,
} = require("../controllersFloder/accountController");
const {
  getWishlistController,
  removeWishlistController,
} = require("../controllersFloder/wishlistController");
const {
  getNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
} = require("../controllersFloder/notificationController");
const UserDeleteContollar = require("../controllersFloder/UserDeleteContollar");
const admin = require("../middlewareFloder/admin");
const ForgotPasswordContollar = require("../controllersFloder/ForgotPasswordContollar");
const ResetPasswordContollar = require("../controllersFloder/ResetPasswordContollar");
const GetAllVendorController = require("../controllersFloder/GetAllVendorController");
const ApproveVendorController = require("../controllersFloder/ApproveVendorController");
const UpdateVendorStatusController = require("../controllersFloder/UpdateVendorStatusController");
const DashboardStatsController = require("../controllersFloder/DashboardStatsController");
const userrouter = express.Router();

userrouter.post("/signup", SingupController);
userrouter.get("/User", protect, admin, UserContollar);
userrouter.delete("/UserDelete/:id", protect, admin, UserDeleteContollar);
userrouter.post("/login", loginUser);
userrouter.post("/ForgotPassword", ForgotPasswordContollar);
userrouter.post("/ResetPassword", ResetPasswordContollar);
userrouter.get("/profile", protect, profileController);
userrouter.put("/update-profile", protect, updateProfileController);
userrouter.post("/change-password", protect, changePasswordController);
userrouter.get("/wishlist", protect, getWishlistController);
userrouter.delete("/wishlist/:productId", protect, removeWishlistController);
userrouter.get("/notifications", protect, getNotificationsController);
userrouter.put(
  "/notifications/:id/read",
  protect,
  markNotificationReadController,
);
userrouter.put(
  "/notifications/read-all",
  protect,
  markAllNotificationsReadController,
);
userrouter.get("/vendors", protect, admin, GetAllVendorController);
userrouter.put("/vendors/:id/approve", protect, admin, ApproveVendorController);
userrouter.put(
  "/vendors/:id/status",
  protect,
  admin,
  UpdateVendorStatusController,
);
userrouter.get("/dashboard-stats", protect, admin, DashboardStatsController);
userrouter.get("/admin", protect, admin, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = userrouter;

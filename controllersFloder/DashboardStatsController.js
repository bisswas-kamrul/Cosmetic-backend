const UserList = require("../Moddel/Usershema");
const ProductList = require("../Moddel/Productshema");
const Order = require("../Moddel/Ordershema");
const Vendor = require("../Moddel/VendorSchema");
const Review = require("../Moddel/ReviewSchema");

async function DashboardStatsController(req, res) {
  try {
    const [
      users,
      vendors,
      pendingVendors,
      products,
      orders,
      reviews,
      revenueResult,
    ] = await Promise.all([
      UserList.countDocuments({ role: "customer" }),
      UserList.countDocuments({ role: "vendor" }),
      Vendor.countDocuments({ approvalStatus: "pending" }),
      ProductList.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: { $ifNull: ["$finalTotal", "$totalAmount"] } },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        users,
        vendors,
        pendingVendors,
        products,
        orders,
        reviews,
        revenue: revenueResult[0]?.revenue || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = DashboardStatsController;

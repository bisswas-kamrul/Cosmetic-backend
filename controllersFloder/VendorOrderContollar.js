const Order = require("../Moddel/Ordershema");

async function VendorOrderContollar(req, res) {
  try {
    let orders;

    if (req.user.role === "admin") {
      orders = await Order.find().sort({ createdAt: -1 });
    } else {
      orders = await Order.find({
        "items.vendorId": req.user._id,
      }).sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = VendorOrderContollar;
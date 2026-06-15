const Order = require("../Moddel/Ordershema");

async function UpdateVendorOrderStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["pending", "processing", "shipped", "delivered"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const ownsOrder = order.items.some(
      (item) => String(item.vendorId) === String(req.user._id),
    );

    if (req.user.role !== "admin" && !ownsOrder) {
      return res.status(403).json({ message: "Access denied" });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = UpdateVendorOrderStatusController;

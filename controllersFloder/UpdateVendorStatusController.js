const UserList = require("../Moddel/Usershema");
const Vendor = require("../Moddel/VendorSchema");

async function UpdateVendorStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["active", "blocked", "pending"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid vendor status",
      });
    }

    const vendorUser = await UserList.findOneAndUpdate(
      { _id: id, role: "vendor" },
      { status },
      { new: true },
    ).select("-password");

    if (!vendorUser) {
      return res.status(404).json({
        message: "Vendor not found",
      });
    }

    await Vendor.findOneAndUpdate(
      { userId: id },
      {
        approvalStatus:
          status === "active" ? "approved" : status === "blocked" ? "rejected" : "pending",
      },
      { new: true },
    );

    res.json({
      message: "Vendor status updated successfully",
      data: vendorUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = UpdateVendorStatusController;

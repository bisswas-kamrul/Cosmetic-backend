const UserList = require("../Moddel/Usershema");
const Vendor = require("../Moddel/VendorSchema");

async function ApproveVendorController(req, res) {
  try {
    const { id } = req.params;

    const vendor = await UserList.findByIdAndUpdate(
      id,
      {
        status: "active",
      },
      { new: true }
    ).select("-password");

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({
        message: "Vendor not found",
      });
    }

    await Vendor.findOneAndUpdate(
      { userId: id },
      { approvalStatus: "approved" },
      { new: true }
    );

    res.json({
      message: "Vendor approved successfully",
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = ApproveVendorController;

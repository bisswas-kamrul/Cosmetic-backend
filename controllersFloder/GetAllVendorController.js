const UserList = require("../Moddel/Usershema");
const Vendor = require("../Moddel/VendorSchema");

async function GetAllVendorController(req, res) {
  try {
    const vendorUsers = await UserList.find({
      role: "vendor",
    }).select("-password");

    const vendorProfiles = await Vendor.find({
      userId: { $in: vendorUsers.map((vendor) => vendor._id) },
    });

    const profilesByUser = vendorProfiles.reduce((acc, profile) => {
      acc[String(profile.userId)] = profile;
      return acc;
    }, {});

    const vendors = vendorUsers.map((vendor) => ({
      ...vendor.toObject(),
      vendorProfile: profilesByUser[String(vendor._id)] || null,
    }));

    res.json({
      data: vendors,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = GetAllVendorController;

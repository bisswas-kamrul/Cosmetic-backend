const bcrypt = require("bcrypt");
const cloudinary = require("../middlewareFloder/cloudinary");
const fs = require("fs");
const UserList = require("../Moddel/Usershema");
const Notification = require("../Moddel/NotificationSchema");

const publicUserFields = "_id name lastName email avatar phone address role status";

async function createNotification(userId, title, message, type = "system") {
  return Notification.create({ userId, title, message, type });
}

async function updateProfileController(req, res) {
try {
    const { name, lastName, phone, address } = req.body;

    const updateData = {};

    if (name) updateData.name = name.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (phone) updateData.phone = phone.trim();
    if (address) updateData.address = address.trim();

    // avatar upload
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      fs.unlinkSync(req.file.path);
      updateData.avatar = result.secure_url;
    }

    const user = await UserList.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select(
      "_id name lastName email avatar phone address role status"
    );

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function changePasswordController(req, res) {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    const user = await UserList.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await createNotification(
      req.user._id,
      "Password changed",
      "Your account password was changed successfully.",
      "security",
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  updateProfileController,
  changePasswordController,
  createNotification,
};

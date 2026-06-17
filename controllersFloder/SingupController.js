const UserList = require("../Moddel/Usershema");
const Vendor = require("../Moddel/VendorSchema");
const EmailVerifacation = require("../RegexFloder/EmailVerifacation.js");
const bcrypt = require("bcrypt");
async function SingupController(req, res) {
  try {
    const { name, lastName, email, password, role, storeName, phone, address } =
      req.body;

    if (!name || !lastName || !email || !password) {
      return res.json({
        message: "Fill in all the blanks.",
      });
    }

    // Check if an admin already exists
    const adminExists = await UserList.findOne({ role: "admin" });

    // Set role
    const role = adminExists ? "customer" : "admin";

    const cheklist = await UserList.findOne({
      email: email.toLowerCase(),
    });

    if (cheklist) {
      return res.json({
        message: "This email has already been used.",
      });
    }

    if (!EmailVerifacation(email)) {
      return res.json({
        message: "Email format invalid",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const EmailPost = new UserList({
      name,
      lastName,
      email: email.toLowerCase(),
      password: hash,
      verification: true,
      avatar: "",
      role: role === "vendor" ? "vendor" : "customer",
      status: role === "vendor" ? "pending" : "active",
    });
    await EmailPost.save();

    if (role === "vendor") {
      await Vendor.create({
        userId: EmailPost._id,
        storeName: storeName || `${name} ${lastName}`.trim(),
        phone: phone || "",
        address: address || "",
        approvalStatus: "pending",
      });
    }

    res.send({
      message:
        role === "vendor"
          ? "Vendor registration successful. Please wait for admin approval."
          : "Signup successful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = SingupController;

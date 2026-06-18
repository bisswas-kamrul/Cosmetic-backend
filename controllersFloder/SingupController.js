const UserList = require("../Moddel/Usershema");
const Vendor = require("../Moddel/VendorSchema");
const EmailVerifacation = require("../RegexFloder/EmailVerifacation.js");
const bcrypt = require("bcrypt");

async function SingupController(req, res) {
  try {
    const {
      name,
      lastName,
      email,
      password,
      role: requestedRole,
      storeName,
      phone,
      address,
    } = req.body;

    // Check required fields
    if (!name || !lastName || !email || !password) {
      return res.json({
        message: "Fill in all the blanks.",
      });
    }

    // Check email already exists
    const cheklist = await UserList.findOne({
      email: email.toLowerCase(),
    });

    if (cheklist) {
      return res.json({
        message: "This email has already been used.",
      });
    }

    // Validate email
    if (!EmailVerifacation(email)) {
      return res.json({
        message: "Email format invalid",
      });
    }

    // Check if admin exists
    const adminExists = await UserList.findOne({
      role: "admin",
    });

    let finalRole;
    let status = "active";

    if (!adminExists) {
      // First user becomes admin
      finalRole = "admin";
    } else if (requestedRole === "vendor") {
      // Vendor request
      finalRole = "vendor";
      status = "pending";
    } else {
      // Normal customer
      finalRole = "customer";
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Save user
    const EmailPost = new UserList({
      name,
      lastName,
      email: email.toLowerCase(),
      password: hash,
      verification: true,
      avatar: "",
      phone: phone || "",
      address: address || "",
      role: finalRole,
      status: status,
    });

    await EmailPost.save();

    // Create vendor data
    if (finalRole === "vendor") {
      await Vendor.create({
        userId: EmailPost._id,
        storeName: storeName || `${name} ${lastName}`.trim(),
        phone: phone || "",
        address: address || "",
        approvalStatus: "pending",
      });
    }

    return res.status(201).json({
      message:
        finalRole === "vendor"
          ? "Vendor registration successful. Please wait for admin approval."
          : "Signup successful",
      role: finalRole,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = SingupController;
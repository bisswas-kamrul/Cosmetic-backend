const UserList = require("../Moddel/Usershema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await UserList.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (!user.verification) {
      return res.status(400).json({ message: "Email not verified" });
    }

    if (user.status === "pending") {
      return res.status(403).json({
        message: "Vendor approval pending",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Account blocked by admin",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      token,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
module.exports = loginUser;

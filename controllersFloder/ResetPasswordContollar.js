const UserList = require("../Moddel/Usershema");
const bcrypt = require("bcrypt");

async function ResetPasswordContollar(req, res) {
  try {
    const { email, otp, newpassword } = req.body;

    const user = await UserList.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    // password hash
    const hashedPassword = await bcrypt.hash(newpassword, 10);

    // update password
    user.password = hashedPassword;

    // remove otp
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = ResetPasswordContollar;
const UserList = require("../Moddel/Usershema");
const nodemailer = require("nodemailer");

async function ForgotPasswordContollar(req, res) {
  try {
    const { email } = req.body;

    const user = await UserList.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // generate 6 digit otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // mail sender
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset OTP</h2>
        <h1>${otp}</h1>
        <p>OTP valid for 10 minutes</p>
      `,
    });

    res.json({
      message: "OTP sent to email",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = ForgotPasswordContollar;
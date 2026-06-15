const Coupon = require("../Moddel/CouponSchema.js");
async function ShowCouponContollar(req, res) {
  try {
    const coupons = await Coupon.find();

    res.status(200).json({
      success: true,
      totalCoupons: coupons.length,
      coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
module.exports = ShowCouponContollar;

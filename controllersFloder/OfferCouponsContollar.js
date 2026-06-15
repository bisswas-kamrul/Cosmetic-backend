const Coupon = require("../Moddel/CouponSchema");
async function OfferCouponsContollar(req, res) {
  try {
    const now = new Date();

    const coupons = await Coupon.find({
      active: true,
      expireDate: { $gt: now },
    });

    res.json({
      success: true,
      coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
module.exports = OfferCouponsContollar;

const Coupon = require("../Moddel/CouponSchema");

async function CreactCouponContollar(req, res) {
  try {
    const { code, discountPercent, expireDate, minPurchase } = req.body;

    if (!code || !discountPercent || !expireDate) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const cleanCode = code.trim().toUpperCase();

    const existingCoupon = await Coupon.findOne({ code: cleanCode });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon already exists",
      });
    }

    //  FIX: proper date + end of day
    const formattedExpireDate = new Date(expireDate);
    formattedExpireDate.setHours(23, 59, 59, 999);

    const newCoupon = await Coupon.create({
      code: cleanCode,
      discountPercent: Number(discountPercent),
      expireDate: formattedExpireDate,
      minPurchase: Number(minPurchase) || 0,
      active: true,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon Created Successfully",
      coupon: newCoupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = CreactCouponContollar;
const Coupon = require("../Moddel/CouponSchema.js");

async function couponContollar(req, res) {
  try {
    const { code, totalAmount } = req.body;

    const amount = Number(totalAmount);

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon",
      });
    }

    if (!coupon.active) {
      return res.status(400).json({
        success: false,
        message: "Coupon inactive",
      });
    }

    // FIXED DATE CHECK
    const now = Date.now();
    const expire = new Date(coupon.expireDate).getTime();

    if (expire < now) {
      return res.status(400).json({
        success: false,
        message: "Coupon expired",
      });
    }

    if (amount < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase ${coupon.minPurchase}`,
      });
    }

    const discount = (amount * coupon.discountPercent) / 100;
    const finalAmount = amount - discount;

    return res.status(200).json({
      success: true,
      coupon: coupon.code,
      discount,
      finalAmount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = couponContollar;
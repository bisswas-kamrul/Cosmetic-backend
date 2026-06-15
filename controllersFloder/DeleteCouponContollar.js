const Coupon = require("../Moddel/CouponSchema");

async function DeleteCouponContollar(req, res) {
  try {
    const { id } = req.params;

    // FIND & DELETE
    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = DeleteCouponContollar;
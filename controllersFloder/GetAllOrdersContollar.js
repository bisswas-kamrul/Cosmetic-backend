const Order = require ("../Moddel/Ordershema.js")
async function GetAllOrdersContollar (req ,res) {
    try {
    const orders = await Order.find().populate({
      path: "products.productId",
      select: "name price",
    });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
module.exports = GetAllOrdersContollar
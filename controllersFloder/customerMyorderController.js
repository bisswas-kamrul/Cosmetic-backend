const Order = require("../Moddel/Ordershema");

const customerMyorderController = async (req, res) => {
 try {

    const orders = await Order.find({
      user: req.user._id,
    });

    res.json({
      success: true,
      orders,
    });

  } catch (error) {

    res.status(500).json({
      message: "Server Error",
    });

  }
};

module.exports = customerMyorderController;

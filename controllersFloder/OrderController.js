const Order = require("../Moddel/Ordershema");
const sendEmail = require("../utils/sendEmail.js");
const Product = require("../Moddel/Productshema");

async function OrderController(req, res) {
  try {
    const {
      name,
      phone,
      address,
      totalAmount,
      items,
      email,
      paymentMethod,
      discount,
      finalTotal,
      couponCode,
      transactionId,
      paymentNumber,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    const updatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const quantity = Number(item.quantity) || 0;

      if (quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity",
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} Out Of Stock`,
        });
      }

      updatedItems.push({
        productId: product._id,
        vendorId: product.vendorId,
        vendorName: product.vendorName,
        name: product.name,
        image: product.images?.[0] || item.image || "",
        quantity,
        size: item.size,
        color: item.color,
        price: product.price,
      });
    }

    const order = new Order({
      name,
      phone,
      email,
      address,

      totalAmount,

      items: updatedItems,

      paymentMethod,

      discount,

      finalTotal,

      couponCode,

      transactionId,

      paymentNumber,

      user: req.user._id,

      // DEFAULT
      isPaid: false,
      status: "pending",
    });

    await order.save();
    for (const item of updatedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          stock: -item.quantity,
        },
      });
    }

    // EMAIL
    if (email) {
      await sendEmail(
        email,
        "Order Confirmed",

        `
        <h2>Order Confirmed</h2>

        <p>Hello ${name}</p>

        <p>Your order placed successfully.</p>

        <p>Status: pending</p>

        <p>Payment: unpaid</p>

        <h3>Total: ${finalTotal} TK</h3>

        `,
      );
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

module.exports = OrderController;

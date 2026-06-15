const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
    },

    address: {
      type: String,
      required: true,
    },

    paymentMethod: {
      type: String,
      default: "COD",
    },

    // PAYMENT STATUS
    isPaid: {
      type: Boolean,
      default: false,
    },

    // MANUAL PAYMENT INFO
    transactionId: {
      type: String,
      default: "",
    },

    paymentNumber: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserList",
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductList",
        },
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserList",
        },
        vendorName: String,
        name: String,
        image: String,
        quantity: Number,
        size: String,
        color: String,
        price: Number,
      },
    ],

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductList",
        },

        quantity: {
          type: Number,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    finalTotal: Number,

    couponCode: String,

    // ORDER STATUS
    status: {
      type: String,

      enum: ["pending", "processing", "shipped", "delivered"],

      default: "pending",
    },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "items.vendorId": 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);

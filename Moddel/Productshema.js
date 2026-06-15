const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String, // image URLs
      },
    ],
    attributes: {
      color: String,
      size: String,
      ram: String,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    badge: {
      type: Number,
      default: null,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserList",
    },

    vendorName: {
      type: String,
    },
  },
  { timestamps: true },
);

productSchema.index({ vendorId: 1, createdAt: -1 });
productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("ProductList", productSchema);

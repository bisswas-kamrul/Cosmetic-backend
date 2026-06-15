const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserList",
      required: true,
    },

    storeName: {
      type: String,
      required: true,
    },

    storeLogo: {
      type: String,
      default: "",
    },

    description: String,

    phone: String,

    address: String,

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

vendorSchema.index({ userId: 1 }, { unique: true });
vendorSchema.index({ approvalStatus: 1 });

module.exports = mongoose.model("Vendor", vendorSchema);

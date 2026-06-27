const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      enum: ["english", "bangla"],
      default: "english",
    },
    products: [
      {
        id: String,
        name: String,
        price: Number,
        stock: Number,
      },
    ],
  },
  { timestamps: true, _id: false },
);

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    visitorId: {
      type: String,
      default: "",
      trim: true,
    },
    context: {
      lastProductIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductList",
        },
      ],
      lastIntent: {
        type: String,
        default: "",
      },
      language: {
        type: String,
        enum: ["english", "bangla"],
        default: "english",
      },
    },
    messages: [chatMessageSchema],
  },
  { timestamps: true },
);

chatSessionSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("ChatSession", chatSessionSchema);

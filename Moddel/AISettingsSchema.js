const mongoose = require("mongoose");

const aiSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    systemPrompt: {
      type: String,
      default:
        "You are a helpful customer support assistant for a cosmetics e-commerce website. Answer only using the website information and product data provided to you. Never invent products, prices, stock, or policies. If the customer asks about unrelated topics, politely say that you can only help with this website and its products.",
    },
    welcomeMessage: {
      type: String,
      default:
        "Hi! I can help you find products, compare items, check prices, explain shipping and returns, and guide you through checkout.",
    },
    suggestedQuestions: {
      type: [String],
      default: [
        "Show me best-selling products",
        "Recommend products under $50",
        "What is your return policy?",
        "How does shipping work?",
        "Help me choose a product",
      ],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AISettings", aiSettingsSchema);

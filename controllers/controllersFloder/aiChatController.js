const ProductList = require("../../Moddel/Productshema");
const CategoryList = require("../../Moddel/CategoryShema");
const AISettings = require("../../Moddel/AISettingsSchema");
const {
  sanitizeInput,
  isPromptInjection,
  isUnrelatedTopic,
  extractBudget,
  extractProductKeywords,
  buildProductContext,
} = require("../../utils/aiChatUtils");

const defaultSettings = {
  enabled: true,
  systemPrompt:
    "You are a helpful customer support assistant for a cosmetics e-commerce website. Answer only using the website information and product data provided to you. Never invent products, prices, stock, or policies. If the customer asks about unrelated topics, politely say that you can only help with this website and its products.",
  welcomeMessage:
    "Hi! I can help you find products, compare items, check prices, explain shipping and returns, and guide you through checkout.",
  suggestedQuestions: [
    "Show me best-selling products",
    "Recommend products under $50",
    "What is your return policy?",
    "How does shipping work?",
    "Help me choose a product",
  ],
};

const getOrCreateSettings = async () => {
  let settings = await AISettings.findOne({ key: "default" });

  if (!settings) {
    settings = await AISettings.create({
      key: "default",
      ...defaultSettings,
    });
  }

  return settings;
};

const getAiSettingsController = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    res.json({
      enabled: settings.enabled,
      welcomeMessage: settings.welcomeMessage,
      suggestedQuestions: settings.suggestedQuestions,
      systemPrompt: settings.systemPrompt,
    });
  } catch (error) {
    console.error("AI settings fetch error", error);
    res.status(500).json({ message: "Unable to load AI settings" });
  }
};

const updateAiSettingsController = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { enabled, systemPrompt, welcomeMessage, suggestedQuestions } =
      req.body || {};
    const settings = await getOrCreateSettings();

    settings.enabled =
      typeof enabled === "boolean" ? enabled : settings.enabled;
    settings.systemPrompt =
      typeof systemPrompt === "string" ? systemPrompt : settings.systemPrompt;
    settings.welcomeMessage =
      typeof welcomeMessage === "string"
        ? welcomeMessage
        : settings.welcomeMessage;
    settings.suggestedQuestions = Array.isArray(suggestedQuestions)
      ? suggestedQuestions.filter(Boolean).slice(0, 8)
      : settings.suggestedQuestions;

    await settings.save();

    res.json({
      message: "AI settings updated successfully",
      settings: {
        enabled: settings.enabled,
        welcomeMessage: settings.welcomeMessage,
        suggestedQuestions: settings.suggestedQuestions,
      },
    });
  } catch (error) {
    console.error("AI settings update error", error);
    res.status(500).json({ message: "Unable to update AI settings" });
  }
};

const findRelevantProducts = async (message) => {
  const keywords = extractProductKeywords(message);
  const budget = extractBudget(message);
  const normalizedKeywords = keywords.filter((word) => word.length > 2);

  const searchConditions = [];

  if (normalizedKeywords.length) {
    searchConditions.push(
      ...normalizedKeywords.map((keyword) => ({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })),
    );
  }

  if (budget !== null) {
    searchConditions.push({ price: { $lte: budget } });
  }

  const query = searchConditions.length ? { $or: searchConditions } : {};

  const products = await ProductList.find(query)
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return products;
};

const buildWebsiteContext = async () => {
  const categories = await CategoryList.find({}).limit(6).lean();

  return {
    shippingInfo:
      "Shipping is available for supported regions. Delivery times vary but are usually shared at checkout.",
    returnPolicy:
      "Returns are accepted for unused items within the allowed return window and must follow the return instructions provided with the order.",
    paymentMethods: [
      "Card payments",
      "Cash on delivery",
      "Digital wallet payments",
    ],
    orderProcess:
      "Customers add items to the cart, review the order, complete checkout, and receive order updates after confirmation.",
    faq: [
      "You can track your order after it is confirmed and shipped.",
      "Popular categories include skincare, makeup, and beauty essentials.",
    ],
    categories: categories.map((category) => category.name),
  };
};

const generateFallbackReply = async (
  message,
  products,
  settings,
  websiteContext,
) => {
  const lowerValue = message.toLowerCase();

  if (lowerValue.includes("shipping")) {
    return websiteContext.shippingInfo;
  }

  if (lowerValue.includes("return") || lowerValue.includes("refund")) {
    return websiteContext.returnPolicy;
  }

  if (lowerValue.includes("payment") || lowerValue.includes("pay")) {
    return `Accepted payment methods include ${websiteContext.paymentMethods.join(", ")}.`;
  }

  if (lowerValue.includes("order") || lowerValue.includes("checkout")) {
    return websiteContext.orderProcess;
  }

  if (
    lowerValue.includes("recommend") ||
    lowerValue.includes("similar") ||
    lowerValue.includes("compare") ||
    lowerValue.includes("choose")
  ) {
    if (products.length) {
      const names = products.map((product) => product.name).join(", ");
      return `Here are a few options I found: ${names}. I can help compare their features or suggest the best choice for your budget.`;
    }

    return "I could not find a matching product in the catalog. Please share the product name or a budget so I can help more precisely.";
  }

  if (lowerValue.includes("budget") || lowerValue.includes("under")) {
    if (products.length) {
      const names = products.map((product) => product.name).join(", ");
      return `These options fit the budget well: ${names}.`;
    }
  }

  if (
    lowerValue.includes("latest") ||
    lowerValue.includes("new") ||
    lowerValue.includes("best-selling") ||
    lowerValue.includes("best selling")
  ) {
    if (products.length) {
      const names = products.map((product) => product.name).join(", ");
      return `Here are the currently available options: ${names}.`;
    }
  }

  if (products.length) {
    const firstProduct = products[0];
    return `I found ${firstProduct.name} for $${firstProduct.price}. Stock is currently ${firstProduct.stock}.`;
  }

  return settings.welcomeMessage || defaultSettings.welcomeMessage;
};

const askOpenAI = async (message, settings, products, websiteContext) => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const productContext = buildProductContext(products);
  const payload = {
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 250,
    messages: [
      {
        role: "system",
        content: `${settings.systemPrompt}\n\nOnly use the provided website context and product data. Never invent products or details. If no matching product exists, say so clearly.`,
      },
      {
        role: "user",
        content: `Customer question: ${message}\n\nWebsite context:\n- Shipping: ${websiteContext.shippingInfo}\n- Return policy: ${websiteContext.returnPolicy}\n- Payment methods: ${websiteContext.paymentMethods.join(", ")}\n- Order process: ${websiteContext.orderProcess}\n- Categories: ${websiteContext.categories.join(", ")}\n\nRelevant products:\n${productContext}`,
      },
    ],
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("OpenAI request failed");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
};

const aiChatController = async (req, res) => {
  try {
    const message = sanitizeInput(req.body?.message);

    if (!message) {
      return res
        .status(400)
        .json({ message: "Please enter a question first." });
    }

    if (isPromptInjection(message)) {
      return res
        .status(400)
        .json({
          message: "I can only assist with this website and its products.",
        });
    }

    const settings = await getOrCreateSettings();

    if (!settings.enabled) {
      return res.json({
        reply: settings.welcomeMessage || defaultSettings.welcomeMessage,
        usedFallback: true,
      });
    }

    if (isUnrelatedTopic(message)) {
      return res.json({
        reply:
          "I can only help with this website's products, shipping, returns, payments, and order process.",
        usedFallback: true,
      });
    }

    const websiteContext = await buildWebsiteContext();
    let products = [];
    const productIntent =
      /product|products|price|stock|description|similar|compare|recommend|category|categories|budget|best|latest|new|feature|features|choose|selling/i.test(
        message,
      );

    if (productIntent) {
      products = await findRelevantProducts(message);
    }

    let reply = null;
    let usedFallback = false;

    try {
      reply = await askOpenAI(message, settings, products, websiteContext);
    } catch (error) {
      console.error("OpenAI chat error", error);
      reply = null;
    }

    if (!reply) {
      reply = await generateFallbackReply(
        message,
        products,
        settings,
        websiteContext,
      );
      usedFallback = true;
    }

    res.json({
      reply,
      usedFallback,
      products: products.slice(0, 3).map((product) => ({
        id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock,
      })),
    });
  } catch (error) {
    console.error("AI chat controller error", error);
    res
      .status(500)
      .json({ message: "Unable to process your request right now." });
  }
};

module.exports = {
  aiChatController,
  getAiSettingsController,
  updateAiSettingsController,
};

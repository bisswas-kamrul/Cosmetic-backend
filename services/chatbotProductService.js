const crypto = require("crypto");
const mongoose = require("mongoose");
const ProductList = require("../Moddel/Productshema");
const Coupon = require("../Moddel/CouponSchema");
const ChatSession = require("../Moddel/ChatSessionSchema");

const MAX_HISTORY_MESSAGES = 30;
const FALLBACK_IMAGE = "";

const BANGLA_DIGITS = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

const STOP_WORDS = new Set([
  "a",
  "about",
  "an",
  "and",
  "are",
  "available",
  "best",
  "buy",
  "can",
  "cosmetic",
  "cosmetics",
  "do",
  "for",
  "give",
  "have",
  "hello",
  "hey",
  "hi",
  "i",
  "in",
  "is",
  "it",
  "me",
  "need",
  "of",
  "on",
  "please",
  "product",
  "products",
  "recommend",
  "show",
  "suggest",
  "tell",
  "the",
  "this",
  "to",
  "want",
  "what",
  "which",
  "you",
  "আমার",
  "আমি",
  "আপনার",
  "আছে",
  "এই",
  "এটা",
  "একটা",
  "কি",
  "কী",
  "কোন",
  "করতে",
  "কসমেটিক",
  "কসমেটিকস",
  "চাই",
  "দাও",
  "দেখাও",
  "পণ্য",
  "প্রোডাক্ট",
  "বলুন",
  "ভালো",
  "সাজেস্ট",
  "হবে",
]);

const KEYWORDS = {
  english: {
    greeting: ["hi", "hello", "hey", "good morning", "good evening"],
    recommend: ["recommend", "suggest", "need", "want", "best", "suitable", "for me"],
    stock: ["stock", "available", "availability", "in stock"],
    price: ["price", "cost", "budget", "cheap", "under", "below", "less", "within"],
    offer: ["offer", "coupon", "discount", "deal", "promo"],
    delivery: ["delivery", "shipping", "ship", "courier"],
    payment: ["payment", "pay", "bkash", "nagad", "rocket", "cod", "cash on delivery"],
    returnPolicy: ["return", "refund", "exchange", "cancel"],
    ingredients: ["ingredient", "ingredients", "contains", "formula"],
    usage: ["use", "usage", "apply", "how to", "routine"],
    benefits: ["benefit", "benefits", "good for", "works for"],
    skinType: ["skin", "oily", "dry", "sensitive", "combination", "acne"],
    hairType: ["hair", "scalp", "dandruff", "frizzy", "curly"],
    purchase: ["buy", "order", "checkout", "cart", "purchase", "take it"],
    objection: ["expensive", "costly", "too much", "not sure", "confused", "worth", "trust"],
  },
  bangla: {
    greeting: ["হাই", "হ্যালো", "সালাম", "আসসালামু", "নমস্কার"],
    recommend: ["সাজেস্ট", "রেকমেন্ড", "পরামর্শ", "চাই", "লাগবে", "উপযুক্ত"],
    stock: ["স্টক", "আছে", "পাওয়া", "পাওয়া", "এভেইলেবল"],
    price: ["দাম", "মূল্য", "প্রাইস", "টাকা", "৳", "কম", "বাজেট"],
    offer: ["অফার", "কুপন", "ডিসকাউন্ট", "ছাড়", "ছাড়"],
    delivery: ["ডেলিভারি", "শিপিং", "কুরিয়ার", "কুরিয়ার"],
    payment: ["পেমেন্ট", "পে", "বিকাশ", "নগদ", "রকেট", "ক্যাশ"],
    returnPolicy: ["রিটার্ন", "রিফান্ড", "এক্সচেঞ্জ", "বাতিল"],
    ingredients: ["উপাদান", "ইনগ্রেডিয়েন্ট", "ইনগ্রেডিয়েন্ট", "কী আছে"],
    usage: ["ব্যবহার", "কিভাবে", "কীভাবে", "লাগাব", "রুটিন"],
    benefits: ["উপকার", "বেনিফিট", "কাজ", "ভালো"],
    skinType: ["স্কিন", "ত্বক", "অয়েলি", "অয়েলি", "ড্রাই", "সেনসিটিভ", "ব্রণ"],
    hairType: ["চুল", "হেয়ার", "হেয়ার", "স্ক্যাল্প", "খুশকি"],
    purchase: ["কিনব", "কিনতে", "অর্ডার", "কার্ট", "চেকআউট", "নিতে"],
    objection: ["দামী", "বেশি", "নিশ্চিত", "কনফিউজ", "ভরসা", "ভালো হবে"],
  },
};

function normalizeText(value = "") {
  return String(value)
    .replace(/[০-৯]/g, (digit) => BANGLA_DIGITS[digit] || digit)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s৳$.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isBangla(text = "") {
  return /[\u0980-\u09FF]/.test(text);
}

function tokenize(text = "") {
  return normalizeText(text)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function detectIntent(message, language) {
  const text = normalizeText(message);
  const words = KEYWORDS[language];
  const intents = Object.entries(words)
    .filter(([, values]) => hasAny(text, values))
    .map(([key]) => key);

  return {
    primary: intents[0] || "product",
    all: intents,
    greeting: intents.includes("greeting"),
    recommend: intents.includes("recommend"),
    stock: intents.includes("stock"),
    price: intents.includes("price"),
    offer: intents.includes("offer"),
    delivery: intents.includes("delivery"),
    payment: intents.includes("payment"),
    returnPolicy: intents.includes("returnPolicy"),
    ingredients: intents.includes("ingredients"),
    usage: intents.includes("usage"),
    benefits: intents.includes("benefits"),
    skinType: intents.includes("skinType"),
    hairType: intents.includes("hairType"),
    purchase: intents.includes("purchase"),
    objection: intents.includes("objection"),
  };
}

function getAttributesText(attributes) {
  if (!attributes) return "";
  if (typeof attributes === "string") {
    try {
      return Object.values(JSON.parse(attributes)).filter(Boolean).join(" ");
    } catch (error) {
      return attributes;
    }
  }
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key} ${value}`)
    .join(" ");
}

function formatProduct(product) {
  const images = Array.isArray(product.images) ? product.images : [product.images].filter(Boolean);
  return {
    id: String(product._id),
    name: product.name || "",
    description: product.description || "",
    price: product.price,
    image: images[0] || FALLBACK_IMAGE,
    images,
    attributes: product.attributes || {},
    stock: Number(product.stock) || 0,
    badge: product.badge,
    vendorName: product.vendorName || "",
    available: Number(product.stock) > 0,
  };
}

function productSearchText(product) {
  return normalizeText(
    [
      product.name,
      product.description,
      getAttributesText(product.attributes),
      product.vendorName,
      product.badge ? `${product.badge} discount offer` : "",
    ].join(" "),
  );
}

function getPriceLimit(message) {
  const text = normalizeText(message);
  const numbers = text.match(/\d+(?:\.\d+)?/g);
  if (!numbers) return null;

  const hasUpperLimitWord =
    /\b(under|below|less|within|max|maximum|cheap|budget)\b/.test(text) ||
    /(কম|নিচে|ভিতরে|মধ্যে|বাজেট)/.test(text);

  if (!hasUpperLimitWord) return null;
  return Math.max(...numbers.map(Number));
}

function scoreProduct(product, queryTokens, priceLimit, contextProductIds) {
  const text = productSearchText(product);
  let score = 0;

  queryTokens.forEach((token) => {
    if (text.includes(token)) {
      score += normalizeText(product.name).includes(token) ? 5 : 2;
    }
  });

  if (priceLimit && Number(product.price) <= priceLimit) score += 3;
  if (contextProductIds.includes(String(product.id))) score += 4;
  if (product.available) score += 1;

  return score;
}

function buildProductLine(product, language, includeDescription = false) {
  const price = `৳${product.price}`;
  const stock = language === "bangla" ? `স্টক: ${product.stock}` : `stock: ${product.stock}`;
  const summary = includeDescription && product.description ? ` - ${product.description}` : "";
  return `${product.name} - ${price}, ${stock}${summary}`;
}

function compactDescription(product, maxLength = 150) {
  const description = String(product.description || "").replace(/\s+/g, " ").trim();
  if (!description) return "";
  if (description.length <= maxLength) return description;
  return `${description.slice(0, maxLength - 3).trim()}...`;
}

function buildFitReason(product, language) {
  const facts = [];
  const description = compactDescription(product);
  const attributesText = getAttributesText(product.attributes);

  if (description) {
    facts.push(
      language === "bangla"
        ? `ডাটাবেসে বিবরণ আছে: ${description}`
        : `the database description says: ${description}`,
    );
  }

  if (attributesText) {
    facts.push(
      language === "bangla"
        ? `অ্যাট্রিবিউট: ${attributesText}`
        : `attributes: ${attributesText}`,
    );
  }

  if (Number(product.badge) > 0) {
    facts.push(
      language === "bangla"
        ? `${product.badge}% ব্যাজ/অফার দেখানো আছে`
        : `${product.badge}% badge/offer is shown`,
    );
  }

  facts.push(
    language === "bangla"
      ? `দাম ৳${product.price} এবং স্টক ${product.stock}`
      : `price is ৳${product.price} and stock is ${product.stock}`,
  );

  return facts.join("; ");
}

function buildSalesProductBlock(product, language, index) {
  const label = index === 0 ? "Best match" : `Option ${index + 1}`;
  const banglaLabel = index === 0 ? "সেরা মিল" : `অপশন ${index + 1}`;
  const reason = buildFitReason(product, language);

  if (language === "bangla") {
    return `${banglaLabel}: ${product.name} - ৳${product.price}, স্টক: ${product.stock}\nকেন উপযুক্ত: ${reason}`;
  }

  return `${label}: ${product.name} - ৳${product.price}, stock: ${product.stock}\nWhy it fits: ${reason}`;
}

function buildNeedDiscoveryAnswer(language, topProducts) {
  const preview = topProducts
    .slice(0, 3)
    .map((product, index) => buildSalesProductBlock(product, language, index))
    .join("\n\n");

  if (language === "bangla") {
    return [
      "অবশ্যই, আমি আপনাকে ঠিক পণ্যটি বেছে নিতে সাহায্য করব। ভালোভাবে সাজেস্ট করার জন্য ৩টি বিষয় বলবেন?",
      "১. আপনার স্কিন/হেয়ার টাইপ কী?",
      "২. মূল সমস্যা বা লক্ষ্য কী?",
      "৩. বাজেট কত?",
      preview ? `\nএর মধ্যে ডাটাবেসে থাকা কিছু স্টকে থাকা অপশন দেখাচ্ছি:\n${preview}` : "",
      "যেটা পছন্দ হয় সেটার Product Details খুলে Add To Cart চাপুন, তারপর Checkout এ অর্ডার সম্পন্ন করুন।",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    "Absolutely. I can help you choose the right product, but I want to match it properly.",
    "Tell me 3 quick things: your skin/hair type, your main concern, and your budget.",
    preview ? `\nMeanwhile, these in-stock database options are worth considering:\n${preview}` : "",
    "When one feels right, open Product Details, tap Add To Cart, then go to Checkout to place the order.",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildObjectionAnswer(language, topProducts) {
  if (!topProducts.length) {
    return language === "bangla"
      ? "আমি বুঝতে পারছি। ডাটাবেসে নির্দিষ্ট পণ্য না পেলে আমি অনুমান করে কিছু বলব না। আপনার বাজেট বা দরকারটা বললে আমি স্টকে থাকা কাছাকাছি পণ্য দেখাব।"
      : "I understand. I will not guess without a matching database product. Tell me your budget or concern, and I will show the closest in-stock options.";
  }

  const product = topProducts[0];
  const reason = buildFitReason(product, language);

  if (language === "bangla") {
    return `${product.name} নিয়ে দ্বিধা থাকলে আগে এই ডাটাবেস তথ্যগুলো দেখুন: ${reason}।\n\nআমি চাপ দিচ্ছি না; যদি বাজেট বেশি মনে হয়, আপনার বাজেট বলুন, আমি স্টকে থাকা কাছাকাছি বিকল্প দেখাব। পছন্দ হলে Product Details খুলে Add To Cart করে Checkout করতে পারেন।`;
  }

  return `If you are unsure about ${product.name}, here are the database facts to judge it by: ${reason}.\n\nNo pressure. If the price feels high, tell me your budget and I will suggest the closest in-stock alternative. If it feels right, open Product Details, Add To Cart, then Checkout.`;
}

function buildPurchaseGuidance(language, topProducts) {
  const product = topProducts[0];

  if (!product) {
    return language === "bangla"
      ? "অর্ডার করতে আগে একটি পণ্য বেছে নিতে হবে। আপনার দরকার বা বাজেট বলুন, আমি ডাটাবেস থেকে স্টকে থাকা পণ্য সাজেস্ট করব।"
      : "To order, choose a product first. Tell me your need or budget and I will recommend an in-stock database product.";
  }

  if (language === "bangla") {
    return `${product.name} নিতে চাইলে Product Details খুলুন, size/color দেখে Add To Cart চাপুন, তারপর Checkout পেজে নাম, ফোন, ইমেইল, ঠিকানা ও পেমেন্ট মেথড দিয়ে Place Order করুন।\n\nবর্তমান ডাটাবেস তথ্য: ৳${product.price}, স্টক ${product.stock}।`;
  }

  return `To buy ${product.name}, open Product Details, check size/color, tap Add To Cart, then go to Checkout and enter your name, phone, email, address, and payment method before placing the order.\n\nCurrent database facts: ৳${product.price}, stock ${product.stock}.`;
}

function getKnownFieldAnswer(product, intent, language) {
  const attributesText = getAttributesText(product.attributes);
  const description = product.description;

  if (intent.ingredients) {
    const source = [description, attributesText].filter(Boolean).join(" ");
    if (!source) {
      return language === "bangla"
        ? `${product.name} সম্পর্কে উপাদানের তথ্য আমাদের ডাটাবেসে নেই।`
        : `I do not have ingredient information for ${product.name} in the database.`;
    }
    return language === "bangla"
      ? `${product.name} সম্পর্কে ডাটাবেসে থাকা তথ্য: ${source}`
      : `Database information for ${product.name}: ${source}`;
  }

  if (intent.usage || intent.benefits || intent.skinType || intent.hairType) {
    if (!description && !attributesText) {
      return language === "bangla"
        ? `${product.name} সম্পর্কে ব্যবহার, উপকারিতা বা টাইপের বিস্তারিত তথ্য আমাদের ডাটাবেসে নেই।`
        : `I do not have usage, benefit, skin type, or hair type details for ${product.name} in the database.`;
    }
    return language === "bangla"
      ? `${product.name} সম্পর্কে ডাটাবেসে থাকা বিস্তারিত: ${[description, attributesText].filter(Boolean).join(" ")}`
      : `Here is what the database says about ${product.name}: ${[description, attributesText].filter(Boolean).join(" ")}`;
  }

  return "";
}

async function getSession(sessionId, visitorId) {
  const cleanSessionId =
    typeof sessionId === "string" && sessionId.trim()
      ? sessionId.trim()
      : crypto.randomUUID();

  const session = await ChatSession.findOneAndUpdate(
    { sessionId: cleanSessionId },
    {
      $setOnInsert: {
        sessionId: cleanSessionId,
        visitorId: visitorId || "",
      },
    },
    { new: true, upsert: true },
  );

  return session;
}

function contextProductIdsFromSession(session) {
  return (session?.context?.lastProductIds || []).map((id) => String(id));
}

function enrichTokensWithContext(tokens, products, contextProductIds, message) {
  const normalized = normalizeText(message);
  const isFollowUp =
    tokens.length <= 3 ||
    /\b(it|this|that|one|price|stock|available|ingredients|use|benefits)\b/.test(normalized) ||
    /(এটা|এইটা|ওটা|দাম|স্টক|ব্যবহার|উপকার|উপাদান)/.test(normalized);

  if (!isFollowUp || !contextProductIds.length) return tokens;

  const contextProducts = products.filter((product) => contextProductIds.includes(String(product.id)));
  const contextTokens = contextProducts.flatMap((product) => tokenize(product.name));
  return [...new Set([...tokens, ...contextTokens])];
}

async function getActiveCoupons() {
  const now = new Date();
  return Coupon.find({
    active: true,
    expireDate: { $gt: now },
  })
    .select("code discountPercent expireDate minPurchase")
    .sort({ discountPercent: -1, expireDate: 1 })
    .lean();
}

function buildOfferAnswer(coupons, language) {
  if (!coupons.length) {
    return language === "bangla"
      ? "এই মুহূর্তে ডাটাবেসে কোনো সক্রিয় অফার বা কুপন নেই।"
      : "There are no active offers or coupons in the database right now.";
  }

  const lines = coupons.slice(0, 5).map((coupon) => {
    const minPurchase = Number(coupon.minPurchase) > 0 ? `, min purchase ৳${coupon.minPurchase}` : "";
    return `${coupon.code} - ${coupon.discountPercent}% off${minPurchase}`;
  });

  return language === "bangla"
    ? `ডাটাবেসে থাকা সক্রিয় অফার:\n${lines.join("\n")}`
    : `Active offers from our database:\n${lines.join("\n")}`;
}

function buildUnavailablePolicyAnswer(language, topic) {
  const banglaTopics = {
    delivery: "ডেলিভারি",
    payment: "পেমেন্ট",
    returnPolicy: "রিটার্ন/রিফান্ড",
  };
  const englishTopics = {
    delivery: "delivery",
    payment: "payment",
    returnPolicy: "return or refund",
  };

  return language === "bangla"
    ? `দুঃখিত, ${banglaTopics[topic]} সম্পর্কিত নির্ভরযোগ্য তথ্য আমাদের ডাটাবেসে নেই, তাই আমি অনুমান করে বলতে পারছি না।`
    : `Sorry, I do not have reliable ${englishTopics[topic]} information in the database, so I cannot guess it.`;
}

function buildProductAnswer({ language, matches, unavailableMatches, intent, priceLimit, message }) {
  const availableMatches = matches.filter((product) => product.available);
  const topProducts = availableMatches.slice(0, 4);
  const unavailableProducts = unavailableMatches.slice(0, 3);
  const hasSpecificNeed = tokenize(message).length > 1 || priceLimit || intent.skinType || intent.hairType || intent.usage || intent.benefits || intent.ingredients;

  if (!message.trim()) {
    return language === "bangla"
      ? "আপনার কী ধরনের কসমেটিকস দরকার বলুন। আমি শুধু ডাটাবেসে থাকা পণ্য থেকেই সাহায্য করব।"
      : "Tell me what kind of cosmetics you need. I will only use products stored in our database.";
  }

  if ((intent.greeting || intent.recommend) && !hasSpecificNeed && topProducts.length) {
    return buildNeedDiscoveryAnswer(language, topProducts);
  }

  if (!matches.length && !unavailableMatches.length) {
    return language === "bangla"
      ? "দুঃখিত, এই তথ্য বা পণ্যটি আমাদের ডাটাবেসে খুঁজে পাইনি। আমি পণ্য, দাম, স্টক বা বিবরণ অনুমান করে বলতে পারি না।"
      : "Sorry, I could not find that information or product in our database. I cannot invent product, price, stock, or description details.";
  }

  if (!availableMatches.length && unavailableProducts.length) {
    const unavailableList = unavailableProducts.map((product) => buildProductLine(product, language)).join("\n");
    return language === "bangla"
      ? `এই পণ্যটি এখন স্টকে নেই:\n${unavailableList}\n\nস্টক 0 হলে আমি এটি কেনার জন্য সাজেস্ট করব না।`
      : `This product is not available right now:\n${unavailableList}\n\nBecause stock is 0, I do not recommend purchasing it now.`;
  }

  const singleDetail = topProducts.length === 1 ? getKnownFieldAnswer(topProducts[0], intent, language) : "";
  if (singleDetail) return singleDetail;

  if (intent.purchase) {
    return buildPurchaseGuidance(language, topProducts);
  }

  if (intent.objection) {
    return buildObjectionAnswer(language, topProducts);
  }

  const intro =
    language === "bangla"
      ? priceLimit
        ? `৳${priceLimit} বাজেটের মধ্যে ডাটাবেসে পাওয়া পণ্য:`
        : intent.stock
          ? "ডাটাবেস অনুযায়ী এই পণ্যগুলো এখন স্টকে আছে:"
          : "আপনার প্রয়োজন অনুযায়ী ডাটাবেসে পাওয়া উপযুক্ত পণ্য:"
      : priceLimit
        ? `Products available within ৳${priceLimit} from our database:`
        : intent.stock
          ? "According to the database, these products are currently in stock:"
          : "Suitable products found in our database:";

  const productList = topProducts
    .map((product, index) => buildSalesProductBlock(product, language, index))
    .join("\n\n");
  const complementaryProducts = topProducts.slice(1, 3);
  const complementaryNote =
    complementaryProducts.length > 0
      ? language === "bangla"
        ? `\n\nকমপ্লিমেন্টারি/বিকল্প হিসেবে দেখতে পারেন: ${complementaryProducts.map((product) => product.name).join(", ")}।`
        : `\n\nGood alternatives or complementary picks to compare: ${complementaryProducts.map((product) => product.name).join(", ")}.`
      : "";
  const unavailableNote =
    unavailableProducts.length > 0
      ? language === "bangla"
        ? `\n\nমিল পাওয়া কিছু পণ্য স্টকে নেই, তাই কাছাকাছি স্টকে থাকা পণ্য দেখালাম।`
        : `\n\nSome matching products are out of stock, so I suggested similar available items.`
      : "";
  const close =
    language === "bangla"
      ? "আপনার স্কিন/হেয়ার টাইপ বা বাজেট বললে আমি আরও নির্দিষ্টভাবে বেছে দিতে পারব। পছন্দ হলে Product Details খুলে Add To Cart চাপুন, তারপর Checkout করুন।"
      : "Tell me your skin/hair type or budget if you want me to narrow it down further. If one feels right, open Product Details, Add To Cart, then Checkout.";

  return `${intro}\n${productList}${complementaryNote}${unavailableNote}\n\n${close}`;
}

async function createChatbotReply({ message = "", sessionId = "", visitorId = "" } = {}) {
  const cleanMessage = String(message || "").trim();
  const session = await getSession(sessionId, visitorId);
  const language = isBangla(cleanMessage) ? "bangla" : session.context?.language || "english";
  const intent = detectIntent(cleanMessage, language);

  let answer = "";
  let productsForResponse = [];

  if (intent.offer) {
    const coupons = await getActiveCoupons();
    answer = buildOfferAnswer(coupons, language);
  } else if (intent.delivery || intent.payment || intent.returnPolicy) {
    const topic = intent.delivery ? "delivery" : intent.payment ? "payment" : "returnPolicy";
    answer = buildUnavailablePolicyAnswer(language, topic);
  } else {
    const rawProducts = await ProductList.find()
      .select("name description price images attributes stock badge vendorName")
      .lean();
    const products = rawProducts.map(formatProduct);
    const contextProductIds = contextProductIdsFromSession(session);
    const priceLimit = getPriceLimit(cleanMessage);
    const queryTokens = enrichTokensWithContext(tokenize(cleanMessage), products, contextProductIds, cleanMessage);
    const hasGeneralIntent = intent.greeting || intent.recommend || intent.price || intent.stock;

    const scoredProducts = products
      .map((product) => ({
        ...product,
        score: scoreProduct(product, queryTokens, priceLimit, contextProductIds),
      }))
      .filter((product) => {
        if (priceLimit && Number(product.price) > priceLimit) return false;
        if (!queryTokens.length) return hasGeneralIntent;
        return product.score > 0;
      })
      .sort((a, b) => b.score - a.score || Number(b.stock) - Number(a.stock));

    const genericRecommendation = (!queryTokens.length || !scoredProducts.length) && hasGeneralIntent;
    const matches = genericRecommendation
      ? products
          .filter((product) => product.available && (!priceLimit || Number(product.price) <= priceLimit))
          .sort((a, b) => Number(b.stock) - Number(a.stock))
          .slice(0, 6)
      : scoredProducts;

    const unavailableMatches = scoredProducts.filter((product) => !product.available);

    answer = buildProductAnswer({
      language,
      matches,
      unavailableMatches,
      intent,
      priceLimit,
      message: cleanMessage,
    });
    productsForResponse = matches.filter((product) => product.available).slice(0, 6);
  }

  const contextProductObjectIds = productsForResponse
    .map((product) => product.id)
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .slice(0, 6);

  session.messages.push(
    {
      role: "user",
      text: cleanMessage || " ",
      language,
      products: [],
    },
    {
      role: "assistant",
      text: answer,
      language,
      products: productsForResponse.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
      })),
    },
  );

  if (session.messages.length > MAX_HISTORY_MESSAGES) {
    session.messages = session.messages.slice(-MAX_HISTORY_MESSAGES);
  }

  session.context = {
    lastProductIds: contextProductObjectIds,
    lastIntent: intent.primary,
    language,
  };

  await session.save();

  return {
    sessionId: session.sessionId,
    answer,
    language,
    products: productsForResponse,
  };
}

module.exports = {
  createChatbotReply,
};

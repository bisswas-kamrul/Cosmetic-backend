const ProductList = require("../Moddel/Productshema");

const FALLBACK_IMAGE = "";

const BENGALI_DIGITS = {
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
  "an",
  "and",
  "are",
  "available",
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
  "help",
  "i",
  "in",
  "is",
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
  "the",
  "to",
  "want",
  "what",
  "which",
  "you",
  "আমার",
  "আমি",
  "আছে",
  "আপনার",
  "আসসালামু",
  "করি",
  "কোন",
  "কসমেটিক",
  "কসমেটিকস",
  "হাই",
  "হ্যালো",
  "চাই",
  "দাম",
  "দাও",
  "দেখাও",
  "নিতে",
  "পণ্য",
  "প্রোডাক্ট",
  "বলুন",
  "ভালো",
  "সাজেস্ট",
  "হবে",
]);

const INTENT_WORDS = {
  bangla: {
    greeting: ["হাই", "হ্যালো", "সালাম", "আসসালামু", "নমস্কার"],
    recommend: ["সাজেস্ট", "রেকমেন্ড", "পরামর্শ", "চাই", "লাগবে", "উপযুক্ত"],
    stock: ["স্টক", "আছে", "পাওয়া", "পাওয়া", "এভেইলেবল"],
    price: ["দাম", "মূল্য", "প্রাইস", "টাকা", "৳", "কম", "বাজেট"],
  },
  english: {
    greeting: ["hi", "hello", "hey"],
    recommend: ["recommend", "suggest", "need", "want", "best", "suitable"],
    stock: ["stock", "available", "availability"],
    price: ["price", "cost", "budget", "cheap", "under", "below"],
  },
};

function normalizeText(value = "") {
  return String(value)
    .replace(/[০-৯]/g, (digit) => BENGALI_DIGITS[digit] || digit)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s৳$.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isBangla(text) {
  return /[\u0980-\u09FF]/.test(text);
}

function tokenize(text) {
  return normalizeText(text)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
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

  return Object.values(attributes).filter(Boolean).join(" ");
}

function formatProduct(product) {
  const images = Array.isArray(product.images) ? product.images : [product.images].filter(Boolean);

  return {
    id: product._id,
    name: product.name,
    description: product.description || "",
    price: product.price,
    image: images[0] || FALLBACK_IMAGE,
    images,
    attributes: product.attributes || {},
    stock: product.stock,
    badge: product.badge,
    vendorName: product.vendorName || "",
    available: Number(product.stock) > 0,
  };
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

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function getIntent(message, language) {
  const text = normalizeText(message);
  const words = INTENT_WORDS[language];

  return {
    greeting: hasAny(text, words.greeting),
    recommend: hasAny(text, words.recommend),
    stock: hasAny(text, words.stock),
    price: hasAny(text, words.price),
  };
}

function scoreProduct(product, queryTokens, priceLimit) {
  const attributesText = getAttributesText(product.attributes);
  const searchableText = normalizeText(
    `${product.name || ""} ${product.description || ""} ${attributesText} ${product.vendorName || ""}`,
  );

  let score = 0;

  queryTokens.forEach((token) => {
    if (searchableText.includes(token)) {
      score += product.name && normalizeText(product.name).includes(token) ? 4 : 2;
    }
  });

  if (priceLimit && Number(product.price) <= priceLimit) {
    score += 3;
  }

  if (Number(product.stock) > 0) {
    score += 1;
  }

  return score;
}

function buildProductLine(product, language) {
  if (language === "bangla") {
    return `${product.name} - ৳${product.price}, স্টক: ${product.stock}`;
  }

  return `${product.name} - ৳${product.price}, stock: ${product.stock}`;
}

function buildAnswer({ language, matches, unavailableMatches, priceLimit, intent, originalMessage }) {
  const availableMatches = matches.filter((product) => product.available);
  const topProducts = availableMatches.slice(0, 3);
  const unavailableProducts = unavailableMatches.slice(0, 3);

  if (!originalMessage.trim()) {
    return language === "bangla"
      ? "আপনার কী ধরনের কসমেটিকস দরকার বলুন, আমি শুধু আমাদের ডাটাবেসে থাকা পণ্য থেকেই সাজেস্ট করব।"
      : "Tell me what kind of cosmetics you need, and I will recommend only products stored in our database.";
  }

  if (!matches.length && !unavailableMatches.length) {
    return language === "bangla"
      ? "দুঃখিত, এই পণ্যটি আমাদের উপলব্ধ ক্যাটালগে নেই। আমি ডাটাবেসে নেই এমন পণ্য, দাম বা স্টক তথ্য বলতে পারি না।"
      : "Sorry, that product is not available in our catalog. I cannot make up product, price, or stock information.";
  }

  if (!availableMatches.length && unavailableProducts.length) {
    const productList = unavailableProducts.map((product) => buildProductLine(product, language)).join("\n");
    return language === "bangla"
      ? `এই পণ্যটি এখন পাওয়া যাচ্ছে না:\n${productList}\n\nস্টক 0 হলে আমি এটি কিনতে সাজেস্ট করব না।`
      : `This product is not available right now:\n${productList}\n\nBecause stock is 0, I do not recommend purchasing it now.`;
  }

  const intro =
    language === "bangla"
      ? intent.price && priceLimit
        ? `৳${priceLimit} বাজেটের মধ্যে ডাটাবেসে পাওয়া পণ্য:`
        : intent.stock
          ? "ডাটাবেস অনুযায়ী এই পণ্যগুলো এখন স্টকে আছে:"
          : "আপনার প্রয়োজন অনুযায়ী ডাটাবেসে পাওয়া উপযুক্ত পণ্য:"
      : intent.price && priceLimit
        ? `Products available within ৳${priceLimit} from our database:`
        : intent.stock
          ? "According to the database, these products are currently in stock:"
          : "Suitable products found in our database:";

  const productList = topProducts.map((product) => buildProductLine(product, language)).join("\n");
  const close =
    language === "bangla"
      ? "পছন্দ হলে পণ্যটি খুলে বিস্তারিত দেখে অর্ডার করতে পারেন।"
      : "If you like one, open the product details and place your order.";

  return `${intro}\n${productList}\n\n${close}`;
}

async function createChatbotReply(message = "") {
  const language = isBangla(message) ? "bangla" : "english";
  const normalizedMessage = normalizeText(message);
  const queryTokens = tokenize(message);
  const priceLimit = getPriceLimit(message);
  const intent = getIntent(message, language);

  const products = await ProductList.find()
    .select("name description price images attributes stock badge vendorName")
    .lean();

  const scoredProducts = products
    .map((product) => ({
      ...formatProduct(product),
      score: scoreProduct(product, queryTokens, priceLimit),
    }))
    .filter((product) => {
      if (priceLimit && Number(product.price) > priceLimit) return false;
      if (!queryTokens.length) return intent.greeting || intent.recommend || intent.price || intent.stock;
      return product.score > 0;
    })
    .sort((a, b) => b.score - a.score || Number(b.stock) - Number(a.stock));

  const hasGeneralSupportIntent = intent.greeting || intent.recommend || intent.price || intent.stock;
  const genericRecommendation = (!queryTokens.length || !scoredProducts.length) && hasGeneralSupportIntent;

  const matches = genericRecommendation
    ? products
        .map(formatProduct)
        .filter((product) => Number(product.stock) > 0 && (!priceLimit || Number(product.price) <= priceLimit))
        .sort((a, b) => Number(b.stock) - Number(a.stock))
        .slice(0, 6)
    : scoredProducts;

  const unavailableMatches = scoredProducts.filter((product) => !product.available);
  const answer = buildAnswer({
    language,
    matches,
    unavailableMatches,
    priceLimit,
    intent,
    originalMessage: normalizedMessage,
  });

  return {
    answer,
    language,
    products: matches.filter((product) => product.available).slice(0, 6),
  };
}

module.exports = {
  createChatbotReply,
};

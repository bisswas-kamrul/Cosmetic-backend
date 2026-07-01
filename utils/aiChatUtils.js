const MAX_MESSAGE_LENGTH = 500;

const sanitizeInput = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
};

const isPromptInjection = (value) => {
  const lowerValue = value.toLowerCase();
  return [
    "ignore previous instructions",
    "system prompt",
    "developer message",
    "act as",
    "override your instructions",
  ].some((pattern) => lowerValue.includes(pattern));
};

const isUnrelatedTopic = (value) => {
  const lowerValue = value.toLowerCase();
  const unrelatedTerms = [
    "politics",
    "war",
    "math",
    "equation",
    "coding",
    "programming",
    "javascript",
    "python",
    "stock market",
    "religion",
  ];

  const hasWebsiteTerms =
    /product|price|stock|shipping|return|order|payment|category|coupon|wishlist|checkout|description/i.test(
      lowerValue,
    );

  return (
    unrelatedTerms.some((term) => lowerValue.includes(term)) && !hasWebsiteTerms
  );
};

const extractBudget = (value) => {
  const match = value.match(/\$?(\d{1,5})/);
  if (!match) {
    return null;
  }

  return Number(match[1]);
};

const extractProductKeywords = (value) => {
  const cleaned = value
    .toLowerCase()
    .replace(
      /what|show|find|tell|me|about|the|a|an|for|can|you|help|with|please|recommend|compare|latest|best|selling|under|budget|price|stock|product|products|item|items|order|shipping|return|payment|category|categories|checkout|wishlist|coupon/gi,
      " ",
    )
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();

  return cleaned.split(/\s+/).filter(Boolean).slice(0, 4);
};

const buildProductContext = (products) => {
  if (!products?.length) {
    return "No matching products found.";
  }

  return products
    .map((product) => {
      const description = product.description
        ? product.description.slice(0, 140)
        : "No description provided";
      return `- ${product.name}: price $${product.price}, stock ${product.stock}, description: ${description}`;
    })
    .join("\n");
};

module.exports = {
  MAX_MESSAGE_LENGTH,
  sanitizeInput,
  isPromptInjection,
  isUnrelatedTopic,
  extractBudget,
  extractProductKeywords,
  buildProductContext,
};

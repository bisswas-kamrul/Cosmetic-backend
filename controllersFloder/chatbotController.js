const { createChatbotReply } = require("../services/chatbotProductService");

async function chatbotController(req, res) {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message : "";

    if (message.length > 1000) {
      return res.status(400).json({
        message: "Message is too long",
      });
    }

    const reply = await createChatbotReply(message);

    return res.json({
      message: "Chatbot reply",
      data: reply,
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    return res.status(500).json({
      message: "Chatbot service error",
    });
  }
}

module.exports = chatbotController;

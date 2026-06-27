const { createChatbotReply } = require("../services/chatbotProductService");

async function chatbotController(req, res) {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message : "";
    const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : "";
    const visitorId = typeof req.body?.visitorId === "string" ? req.body.visitorId : "";

    if (message.length > 1000) {
      return res.status(400).json({
        message: "Message is too long",
      });
    }

    if (!message.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const reply = await createChatbotReply({
      message,
      sessionId,
      visitorId,
    });

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

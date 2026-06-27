const express = require("express");
const chatbotController = require("../controllersFloder/chatbotController");

const chatbotRouter = express.Router();

chatbotRouter.post("/chatbot/message", chatbotController);

module.exports = chatbotRouter;

const express = require("express");
const SubscriberContollar = require("../controllersFloder/SubscriberContollar");
const ContactContollar = require("../controllersFloder/ContactContollar");
const contactGetContollar = require("../controllersFloder/contactGetContollar");
const deleteContactContollar = require("../controllersFloder/deleteContactContollar");
const SubscriberGetContollar = require("../controllersFloder/SubscriberGetContollar");
const deleteSubscriberContollar = require("../controllersFloder/deleteSubscriberContollar");
const protect = require("../middlewareFloder/authMiddleware");
const admin = require("../middlewareFloder/admin");
const SubscriberRouter = express.Router();

SubscriberRouter.post("/Subscriber", SubscriberContollar)
SubscriberRouter.get("/SubscriberGet", protect, admin, SubscriberGetContollar)
SubscriberRouter.delete("/SubscriberDelete/:id", protect, admin, deleteSubscriberContollar)
SubscriberRouter.post("/contact", ContactContollar)
SubscriberRouter.get("/contactGet", protect, admin, contactGetContollar)
SubscriberRouter.delete("/contactDelete/:id", protect, admin, deleteContactContollar)

module.exports = SubscriberRouter

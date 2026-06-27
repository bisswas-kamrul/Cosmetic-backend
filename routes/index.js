const express = require("express");
const userrouter = require("./userRoutes");
const Odearrouter = require("./orderRoutes");
const Paymentrouter = require("./paymentRoutes");
const categoryrouter = require("./category");
const Productrouter = require("./Product");
const SubscriberRouter = require("./Subscriber");
const reviewRouter = require("./reviewRoutes");
const chatbotRouter = require("./chatbotRoutes");



const router = express.Router();

router.use("/",userrouter)
router.use("/",Productrouter)
router.use("/",Odearrouter)
router.use("/",Paymentrouter)
router.use("/",categoryrouter)
router.use("/",SubscriberRouter)
router.use("/",reviewRouter)
router.use("/",chatbotRouter)
module.exports = router;

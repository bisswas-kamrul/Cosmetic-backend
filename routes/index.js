const express = require("express");
const userrouter = require("./userRoutes");
const Productrouter = require("./Product");
const categoryrouter = require("./category");
const Odearrouter = require("./orderRoutes");
const Paymentrouter = require("./paymentRoutes");
const SubscriberRouter = require("./Subscriber");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

router.use(userrouter);
router.use(Productrouter);
router.use(categoryrouter);
router.use(Odearrouter);
router.use(Paymentrouter);
router.use(SubscriberRouter);
router.use(reviewRouter);

module.exports = router;

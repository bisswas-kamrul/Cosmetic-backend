const Subscriber = require ("../Moddel/Subscriber.js")
async function SubscriberContollar (req , res) {
    try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Already subscribed" });
    }

    const newSubscriber = new Subscriber( {email} );
    await newSubscriber.save();

    res.status(201).json({ message: "Subscribed successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
module.exports = SubscriberContollar
const Subscriber = require("../Moddel/Subscriber");
async function SubscriberGetContollar (req , res) {
    try {
        const Sub = await Subscriber.find();
        res.send({
          message: "Show Subscriber List",
          data:Sub
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({
          message: "Server Error",
        });
      }
}
module.exports = SubscriberGetContollar
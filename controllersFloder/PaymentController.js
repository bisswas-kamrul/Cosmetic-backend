const Payment = require("../Moddel/Pementshema");
async function PaymentContollar(req, res) {
  try {
    const { userId, method, amount, transactionId, senderNumber } = req.body;

    if (!userId || !method || !amount || !transactionId || !senderNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const payment = new Payment({
      userId,
      method,
      amount,
      transactionId,
      senderNumber,
    });
    await payment.save();
    res.status(201).json({
      success: true,
      message: "Payment request submitted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = PaymentContollar;

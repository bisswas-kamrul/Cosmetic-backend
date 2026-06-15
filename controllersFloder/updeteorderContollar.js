 const Order = require("../Moddel/Ordershema")
 async function updeteorderContollar(req, res) {
  try {
    const {id} = req.params;
    const { name, phone, email, address, totalAmount, finalTotal, status, isPaid } = req.body;

    const UpdatedOrder = {
      name,
      phone,
      email,
      address,
      totalAmount,
      finalTotal,
      status, 
      isPaid,
    }

    const UpdatedOrderList = await Order.findByIdAndUpdate(id, UpdatedOrder, {
      returnDocument:"after"
    })

    res.json({
      message:"Order Updated Successfully",
      data:UpdatedOrderList,
    })

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
module.exports = updeteorderContollar;

const Order = require("../Moddel/Ordershema")
async function deleteorderContollar(req, res) {
  try {
   const {id} = req.params;
   const DeleteOrder = await Order.findByIdAndDelete(id);

    res.json({
      message:"Order delete Successfully",
      data:DeleteOrder
    })

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
module.exports = deleteorderContollar;

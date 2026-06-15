const ProductList = require("../Moddel/Productshema.js");
async function singleproductContollar(req, res) {
  try {
    const { id } = req.params;
    const product = await ProductList.findById(id);
    if (!product) {
      return res.status(400).json({
        messege: "single product find not",
      });
    }
    res.send({
      messege: "Show single product List",
      data:product
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      messege: "server error",
    });
  }
}
module.exports = singleproductContollar;

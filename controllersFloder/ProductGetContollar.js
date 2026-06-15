const ProductList = require ("../Moddel/Productshema.js")
async function ProductGetContollar(req ,res) {
     try {
    const products = await ProductList.find();

    res.send({
      message: "Show Product List",
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Server Error",
    });
  }
}
module.exports = ProductGetContollar
const ProductList = require("../Moddel/Productshema");

async function MyProductsContollar(req, res) {
  try {
    let products;

    if (req.user.role === "admin") {
      products = await ProductList.find();
    } else {
      products = await ProductList.find({
        vendorId: req.user._id,
      });
    }

    res.json({
      message: "My products",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = MyProductsContollar;
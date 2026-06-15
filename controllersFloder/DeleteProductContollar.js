const ProductList = require("../Moddel/Productshema.js");

async function DeleteProductContollar(req, res) {
  try {
    const { id } = req.params;

    const product = await ProductList.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      product.vendorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const deletedProduct = await ProductList.findByIdAndDelete(id);

    res.json({
      message: "Successfully deleted",
      data: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = DeleteProductContollar;

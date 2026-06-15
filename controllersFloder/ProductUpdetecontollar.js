const ProductList = require("../Moddel/Productshema.js");
async function ProductUpdetecontollar(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, attributes, stock } = req.body;

    // FIX: attributes parse করো
    let imageUrl;

    if (req.file) {
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const parsedAttributes =
      typeof attributes === "string" ? JSON.parse(attributes) : attributes;

    const updateData = {
      name,
      description,
      price,
      stock,
      attributes: parsedAttributes,
      ...(imageUrl && { images: [imageUrl] }),
    };

    const product = await ProductList.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Admin সব edit করতে পারবে
    if (
      req.user.role !== "admin" &&
      product.vendorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const updatedProduct = await ProductList.findByIdAndUpdate(id, updateData, {
        new: true 
    });

    res.json({
      message: "Product Updated Successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
}

module.exports = ProductUpdetecontollar;

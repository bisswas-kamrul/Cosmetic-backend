const ProductList = require("../Moddel/Productshema");
const cloudinary = require("../middlewareFloder/cloudinary");
const fs = require("fs");
async function productContollar(req, res) {
  try {
    const { name, description, price, attributes, badge, stock } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const parsedAttributes = attributes ? JSON.parse(attributes) : {};

    const result = await cloudinary.uploader.upload(req.file.path);

    fs.unlinkSync(req.file.path);
    const newProduct = new ProductList({
      name,
      description,
      price,
      badge,
      attributes: parsedAttributes,
      stock,
      images: [result.secure_url], // Cloudinary image URL
      vendorId: req.user._id,
      vendorName: req.user.name,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

module.exports = productContollar;

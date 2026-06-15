const CetagoryList = require("../Moddel/CategoryShema");
async function createCategory(req, res) {
  try {
    const { name, description } = req.body;

    const duplicate = await CetagoryList.findOne({ name });
    if (duplicate) {
      return res.status(400).json({
        message: "Duplicate category",
      });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const category = new CetagoryList({
      name,
      description,
      images: [imageUrl],
    });

    await category.save();

    res.status(201).json({
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}
module.exports = createCategory;

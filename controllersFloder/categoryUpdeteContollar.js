const CetagoryList = require ("../Moddel/CategoryShema")
async function categoryUpdeteContollar (req ,res) {
      try {
    const { name, description } = req.body;

    let updateData = { name, description };

    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      updateData.images = [imageUrl];
    }

    const updated = await CetagoryList.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ message: "Updated", data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
module. exports = categoryUpdeteContollar
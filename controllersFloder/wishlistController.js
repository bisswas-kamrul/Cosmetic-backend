const Wishlist = require("../Moddel/WishlistSchema");
const ProductList = require("../Moddel/Productshema");
const { createNotification } = require("./accountController");

async function getWishlistController(req, res) {
  try {
    const wishlist = await Wishlist.find({ userId: req.user._id })
      .populate("productId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: wishlist.filter((item) => item.productId),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function addWishlistController(req, res) {
  try {
    const product = await ProductList.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const wishlistItem = await Wishlist.findOneAndUpdate(
      { userId: req.user._id, productId: product._id },
      { userId: req.user._id, productId: product._id },
      { upsert: true, new: true },
    ).populate("productId");

    await createNotification(
      req.user._id,
      "Added to wishlist",
      `${product.name} was added to your wishlist.`,
      "wishlist",
    );

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      data: wishlistItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function removeWishlistController(req, res) {
  try {
    const deletedItem = await Wishlist.findOneAndDelete({
      userId: req.user._id,
      productId: req.params.productId,
    });

    if (!deletedItem) {
      return res.status(404).json({ message: "Wishlist product not found" });
    }

    res.json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getWishlistController,
  addWishlistController,
  removeWishlistController,
};

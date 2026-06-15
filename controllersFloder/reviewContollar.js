const Review = require("../Moddel/ReviewSchema");
const Product = require("../Moddel/Productshema");

async function getProductReviews(req, res) {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
      status: "approved",
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createProductReview(req, res) {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (String(product.vendorId) === String(req.user._id)) {
      return res.status(403).json({ message: "Vendors cannot review their own product" });
    }

    const review = await Review.findOneAndUpdate(
      {
        productId,
        userId: req.user._id,
      },
      {
        productId,
        userId: req.user._id,
        userName: `${req.user.name} ${req.user.lastName || ""}`.trim(),
        rating: Number(rating),
        comment,
        status: "approved",
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(201).json({
      success: true,
      message: "Review saved successfully",
      data: review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getAllReviews(req, res) {
  try {
    const reviews = await Review.find()
      .populate("productId", "name images vendorName")
      .populate("userId", "name lastName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateReviewStatus(req, res) {
  try {
    const { status } = req.body;

    if (!["approved", "hidden"].includes(status)) {
      return res.status(400).json({ message: "Invalid review status" });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteReview(req, res) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getProductReviews,
  createProductReview,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
};

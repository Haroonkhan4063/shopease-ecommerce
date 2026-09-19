const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Recalculate and store a product's average rating + review count
const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const ratingsAverage = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const numReviews = stats.length > 0 ? stats[0].count : 0;

  await Product.findByIdAndUpdate(productId, { ratingsAverage, numReviews });
};

// @desc    Create a review — only buyers who actually purchased (and were paid/delivered) this product
// @route   POST /api/reviews/:productId
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: "Rating and comment are required" });
    }

    const hasPurchased = await Order.findOne({
      buyer: req.user._id,
      isPaid: true,
      "items.product": productId,
    });

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: "You can only review products you have purchased",
      });
    }

    const existing = await Review.findOne({ product: productId, buyer: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already reviewed this product" });
    }

    const review = await Review.create({
      product: productId,
      buyer: req.user._id,
      rating,
      comment,
    });

    await recalculateProductRating(productId);

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for a product (public)
// @route   GET /api/reviews/:productId
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("buyer", "name")
      .sort("-createdAt");
    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a review (owner buyer or admin)
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const isOwner = review.buyer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this review" });
    }

    const productId = review.product;
    await review.deleteOne();
    await recalculateProductRating(productId);

    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const express = require("express");
const router = express.Router();
const { createReview, getProductReviews, deleteReview } = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/auth");

router.get("/:productId", getProductReviews);
router.post("/:productId", protect, authorize("buyer"), createReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;

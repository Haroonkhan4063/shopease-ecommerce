const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require("../controllers/cartController");
const { protect, authorize } = require("../middleware/auth");

// Cart is a buyer-only concept
router.use(protect, authorize("buyer"));

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/", clearCart);
router.put("/:productId", updateCartItem);
router.delete("/:productId", removeCartItem);

module.exports = router;

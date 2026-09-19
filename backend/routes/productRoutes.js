const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public routes
router.get("/", getProducts);

// Seller-only routes (must come before "/:id" so "my-products" isn't treated as an id)
router.get("/my-products", protect, authorize("seller"), getMyProducts);
router.post("/", protect, authorize("seller"), upload.array("images", 5), createProduct);
router.put("/:id", protect, authorize("seller", "admin"), upload.array("images", 5), updateProduct);
router.delete("/:id", protect, authorize("seller", "admin"), deleteProduct);

// Public single-product route
router.get("/:id", getProduct);

module.exports = router;

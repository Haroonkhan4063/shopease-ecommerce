const express = require("express");
const router = express.Router();
const {
  checkout,
  getMyOrders,
  getSellerOrders,
  getOrder,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

router.post("/checkout", protect, authorize("buyer"), checkout);
router.get("/my-orders", protect, authorize("buyer"), getMyOrders);
router.get("/seller-orders", protect, authorize("seller"), getSellerOrders);
router.put("/:id/status", protect, authorize("seller", "admin"), updateOrderStatus);
router.get("/:id", protect, getOrder);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getPendingSellers,
  getAllSellers,
  approveSeller,
  getAllProducts,
  getAllOrders,
  getStats,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/sellers", getAllSellers);
router.get("/sellers/pending", getPendingSellers);
router.put("/sellers/:id/approve", approveSeller);
router.get("/products", getAllProducts);
router.get("/orders", getAllOrders);

module.exports = router;

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// @desc    Get all sellers pending approval
// @route   GET /api/admin/sellers/pending
exports.getPendingSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller", "shopInfo.isApproved": false }).select("-password");
    res.status(200).json({ success: true, count: sellers.length, sellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all sellers (approved + pending)
// @route   GET /api/admin/sellers
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" }).select("-password");
    res.status(200).json({ success: true, count: sellers.length, sellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject a seller
// @route   PUT /api/admin/sellers/:id/approve
exports.approveSeller = async (req, res) => {
  try {
    const { approve } = req.body; // true or false

    const seller = await User.findById(req.params.id);
    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    seller.shopInfo.isApproved = !!approve;
    await seller.save();

    res.status(200).json({
      success: true,
      message: approve ? "Seller approved" : "Seller approval revoked",
      seller,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get every product on the platform (admin oversight — includes inactive ones)
// @route   GET /api/admin/products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("seller", "name shopInfo.shopName").sort("-createdAt");
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get every order on the platform, across all sellers
// @route   GET /api/admin/orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("buyer", "name email")
      .populate("seller", "name shopInfo.shopName")
      .sort("-createdAt");
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Platform-wide summary numbers for an admin dashboard
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalSellers, pendingSellers, totalProducts, totalOrders, revenueAgg] = await Promise.all([
      User.countDocuments({ role: "buyer" }),
      User.countDocuments({ role: "seller" }),
      User.countDocuments({ role: "seller", "shopInfo.isApproved": false }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalBuyers: totalUsers,
        totalSellers,
        pendingSellers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueAgg.length > 0 ? revenueAgg[0].total : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const crypto = require("crypto");
const stripe = require("../config/stripe");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Finalize checkout after a successful Stripe payment.
//          Verifies the payment, splits the cart into one Order per seller,
//          decrements stock, and clears the cart.
// @route   POST /api/orders/checkout
exports.checkout = async (req, res) => {
  try {
    const { paymentIntentId, shippingAddress } = req.body;

    if (!paymentIntentId || !shippingAddress) {
      return res.status(400).json({ success: false, message: "paymentIntentId and shippingAddress are required" });
    }

    // Verify the payment actually succeeded on Stripe's side — never trust the client alone
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ success: false, message: "Payment has not been completed" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Group cart items by seller — each seller gets their own Order document
    const itemsBySeller = {};
    for (const item of cart.items) {
      const product = item.product;
      if (!product) continue;
      const sellerId = product.seller.toString();
      if (!itemsBySeller[sellerId]) itemsBySeller[sellerId] = [];
      itemsBySeller[sellerId].push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || "",
        price: product.discountPrice || product.price,
        quantity: item.quantity,
      });
    }

    const orderGroupId = crypto.randomUUID();
    const createdOrders = [];

    for (const [sellerId, items] of Object.entries(itemsBySeller)) {
      const itemsPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const shippingPrice = itemsPrice > 5000 ? 0 : 200;
      const totalPrice = itemsPrice + shippingPrice;

      const order = await Order.create({
        orderGroupId,
        buyer: req.user._id,
        seller: sellerId,
        items,
        shippingAddress,
        paymentInfo: { id: paymentIntent.id, status: paymentIntent.status },
        itemsPrice,
        shippingPrice,
        totalPrice,
        isPaid: true,
        paidAt: new Date(),
      });

      createdOrders.push(order);

      // Decrement stock for each purchased product
      for (const item of items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
    }

    // Clear the cart now that the order has been placed
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, orderGroupId, orders: createdOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in buyer's own orders
// @route   GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort("-createdAt");
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get orders belonging to the logged-in seller
// @route   GET /api/orders/seller-orders
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id }).populate("buyer", "name email").sort("-createdAt");
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single order by id (buyer who owns it, seller who owns it, or admin)
// @route   GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("buyer", "name email").populate("seller", "name shopInfo.shopName");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.seller._id.toString() === req.user._id.toString();
    if (!isBuyer && !isSeller && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (seller who owns it, or admin) — e.g. Processing -> Shipped -> Delivered
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isSeller = order.seller.toString() === req.user._id.toString();
    if (!isSeller && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this order" });
    }

    order.orderStatus = orderStatus;
    if (orderStatus === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

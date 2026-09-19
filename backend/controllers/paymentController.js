const stripe = require("../config/stripe");
const Cart = require("../models/Cart");

// @desc    Create a Stripe PaymentIntent for the logged-in buyer's current cart
// @route   POST /api/payments/create-payment-intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "price discountPrice stock isActive");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    let itemsPrice = 0;
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return res.status(400).json({ success: false, message: "One of the items in your cart is no longer available" });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: "Not enough stock for one of the items in your cart" });
      }
      const unitPrice = item.product.discountPrice || item.product.price;
      itemsPrice += unitPrice * item.quantity;
    }

    const shippingPrice = itemsPrice > 5000 ? 0 : 200; // flat-rate example: free shipping over Rs. 5000
    const totalPrice = itemsPrice + shippingPrice;

    // Stripe expects the smallest currency unit (e.g. cents/paisa). Adjust if using a
    // zero-decimal currency. Here we assume PKR-like handling — multiply by 100.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: "usd", // swap to your target currency; test mode works with any supported currency
      metadata: { userId: req.user._id.toString() },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

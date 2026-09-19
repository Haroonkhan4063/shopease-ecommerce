import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#111827",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#dc2626" },
  },
};

const CheckoutForm = ({ clientSecret, totalPrice }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleAddressChange = (e) => setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return; // Stripe.js hasn't loaded yet

    setProcessing(true);
    setError("");

    try {
      // Step 1: confirm the card payment with Stripe directly (card details never touch our backend)
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status !== "succeeded") {
        setError("Payment was not completed. Please try again.");
        setProcessing(false);
        return;
      }

      // Step 2: tell our backend the payment succeeded — it verifies with Stripe again,
      // then splits the cart into per-seller orders
      const { data } = await api.post("/orders/checkout", {
        paymentIntentId: paymentIntent.id,
        shippingAddress,
      });

      navigate("/my-orders", { state: { justPlaced: true, orderGroupId: data.orderGroupId } });
      refreshCartCount();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong finalizing your order.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-semibold mb-3">Shipping Address</h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            name="street"
            placeholder="Street address"
            required
            value={shippingAddress.street}
            onChange={handleAddressChange}
            className="col-span-2 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <input
            name="city"
            placeholder="City"
            required
            value={shippingAddress.city}
            onChange={handleAddressChange}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <input
            name="postalCode"
            placeholder="Postal code"
            required
            value={shippingAddress.postalCode}
            onChange={handleAddressChange}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <input
            name="country"
            placeholder="Country"
            required
            value={shippingAddress.country}
            onChange={handleAddressChange}
            className="col-span-2 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Card Details</h2>
        <div className="border rounded-lg px-3 py-3">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Test mode — use card <span className="font-mono">4242 4242 4242 4242</span>, any future expiry, any CVC.
        </p>
      </div>

      {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-brand text-white py-3 rounded-lg font-medium hover:bg-brand-dark transition disabled:opacity-50"
      >
        {processing ? "Processing..." : `Pay $${totalPrice.toFixed(2)}`}
      </button>
    </form>
  );
};

export default CheckoutForm;

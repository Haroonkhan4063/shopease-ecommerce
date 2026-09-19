import { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import api from "../api/axios";
import stripePromise from "../stripe";
import CheckoutForm from "../components/CheckoutForm";

const Checkout = () => {
  const [intentData, setIntentData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createIntent = async () => {
      try {
        const { data } = await api.post("/payments/create-payment-intent");
        setIntentData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not start checkout. Is your cart empty?");
      } finally {
        setLoading(false);
      }
    };
    createIntent();
  }, []);

  if (loading) return <p className="text-center py-20 text-gray-500">Preparing checkout...</p>;

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <p className="bg-red-50 text-red-600 text-sm p-4 rounded-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold mb-1">Checkout</h1>
        <div className="flex justify-between text-sm text-gray-500 mb-6 pb-4 border-b">
          <span>
            Items: ${intentData.itemsPrice.toFixed(2)} + Shipping: ${intentData.shippingPrice.toFixed(2)}
          </span>
          <span className="font-semibold text-gray-900">Total: ${intentData.totalPrice.toFixed(2)}</span>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret: intentData.clientSecret }}>
          <CheckoutForm clientSecret={intentData.clientSecret} totalPrice={intentData.totalPrice} />
        </Elements>
      </div>
    </div>
  );
};

export default Checkout;

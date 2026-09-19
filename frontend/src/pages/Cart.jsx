import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();

  const loadCart = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCart(data.cart);
    } catch (err) {
      setError("Could not load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      setCart(data.cart);
      refreshCartCount();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      setCart(data.cart);
      refreshCartCount();
    } catch (err) {
      setError("Could not remove item");
    }
  };

  if (loading) return <p className="text-center py-20 text-gray-500">Loading cart...</p>;

  const items = cart?.items || [];
  const validItems = items.filter((item) => item.product); // guards against a deleted product still in cart

  const itemsPrice = validItems.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>}

      {validItems.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-4">Your cart is empty.</p>
          <Link to="/" className="text-brand font-medium">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {validItems.map((item) => {
              const price = item.product.discountPrice || item.product.price;
              return (
                <div key={item.product._id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.images?.[0]?.url && (
                      <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product._id}`} className="font-medium hover:text-brand truncate block">
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {item.product.seller?.shopInfo?.shopName || item.product.seller?.name}
                    </p>
                    <p className="text-brand font-bold mt-1">${price}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      className="w-8 h-8 border rounded-lg hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <button onClick={() => removeItem(item.product._id)} className="text-red-500 text-sm hover:underline">
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Subtotal</p>
              <p className="text-2xl font-bold">${itemsPrice.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">Shipping & final total calculated at checkout</p>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="bg-brand text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-dark transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;

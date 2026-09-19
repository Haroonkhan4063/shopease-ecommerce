import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import OrderStatusBadge from "../components/OrderStatusBadge";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await api.get("/orders/my-orders");
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  if (loading) return <p className="text-center py-20 text-gray-500">Loading orders...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">My Orders</h1>

      {location.state?.justPlaced && (
        <p className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-6">
          Order placed successfully! Track its status below.
        </p>
      )}

      {orders.length === 0 ? (
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <OrderStatusBadge status={order.orderStatus} />
              </div>

              <div className="space-y-2 border-t pt-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t mt-3 pt-3 text-sm">
                <span className="text-gray-400">
                  Shipping to: {order.shippingAddress.city}, {order.shippingAddress.country}
                </span>
                <span className="font-bold">Total: ${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ProductFormModal from "../components/ProductFormModal";
import OrderStatusBadge from "../components/OrderStatusBadge";

const SellerDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState(null); // null = closed, {} = add new, {...} = edit
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    const { data } = await api.get("/products/my-products");
    setProducts(data.products);
  };

  const loadOrders = async () => {
    const { data } = await api.get("/orders/seller-orders");
    setOrders(data.orders);
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadOrders()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDeleteProduct = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not delete product");
    }
  };

  const handleStatusChange = async (orderId, orderStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus });
      loadOrders();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update order status");
    }
  };

  const isApproved = user?.shopInfo?.isApproved;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Seller Dashboard</h1>
      <p className="text-gray-500 mb-6">{user?.shopInfo?.shopName}</p>

      {!isApproved && (
        <p className="bg-amber-50 text-amber-700 text-sm p-3 rounded-lg mb-6">
          Your account is awaiting admin approval. You can browse this dashboard, but you can't add products until approved.
        </p>
      )}

      <div className="flex gap-2 mb-6 border-b">
        {["products", "orders"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t ? "border-brand text-brand" : "border-transparent text-gray-500"
            }`}
          >
            {t === "products" ? "My Products" : "Incoming Orders"}
          </button>
        ))}
      </div>

      {message && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{message}</p>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tab === "products" ? (
        <div>
          <button
            onClick={() => setModalProduct({})}
            disabled={!isApproved}
            className="bg-brand text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-dark transition mb-5 disabled:opacity-40"
          >
            + Add Product
          </button>

          {products.length === 0 ? (
            <p className="text-gray-500">No products yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="aspect-video bg-gray-100">
                    {p.images?.[0]?.url && <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium truncate">{p.name}</h3>
                    <p className="text-brand font-bold">${p.discountPrice || p.price}</p>
                    <p className="text-xs text-gray-400 mb-3">
                      Stock: {p.stock} {!p.isActive && "· Inactive"}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModalProduct(p)}
                        className="flex-1 border rounded-lg py-1.5 text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        className="flex-1 border border-red-200 text-red-600 rounded-lg py-1.5 text-sm hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-gray-500">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="bg-white p-5 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">Buyer: {order.buyer?.name}</p>
                  </div>
                  <OrderStatusBadge status={order.orderStatus} />
                </div>

                <div className="space-y-1 border-t pt-3 text-sm">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t mt-3 pt-3">
                  <span className="font-bold text-sm">Total: ${order.totalPrice.toFixed(2)}</span>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-sm"
                  >
                    {["Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {modalProduct !== null && (
        <ProductFormModal
          product={modalProduct._id ? modalProduct : null}
          onClose={() => setModalProduct(null)}
          onSaved={() => {
            setModalProduct(null);
            loadProducts();
          }}
        />
      )}
    </div>
  );
};

export default SellerDashboard;

import { useState, useEffect } from "react";
import api from "../api/axios";
import OrderStatusBadge from "../components/OrderStatusBadge";

const StatCard = ({ label, value }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, sellersRes, productsRes, ordersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/sellers"),
        api.get("/admin/products"),
        api.get("/admin/orders"),
      ]);
      setStats(statsRes.data.stats);
      setSellers(sellersRes.data.sellers);
      setProducts(productsRes.data.products);
      setOrders(ordersRes.data.orders);
    } catch (err) {
      setMessage("Could not load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleApprove = async (sellerId, approve) => {
    try {
      await api.put(`/admin/sellers/${sellerId}/approve`, { approve });
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update seller");
    }
  };

  if (loading) return <p className="text-center py-20 text-gray-500">Loading dashboard...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 mb-6 border-b overflow-x-auto">
        {[
          ["overview", "Overview"],
          ["sellers", "Sellers"],
          ["products", "Products"],
          ["orders", "Orders"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition ${
              tab === key ? "border-brand text-brand" : "border-transparent text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {message && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{message}</p>}

      {tab === "overview" && stats && (
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard label="Total Buyers" value={stats.totalBuyers} />
          <StatCard label="Total Sellers" value={stats.totalSellers} />
          <StatCard label="Pending Approvals" value={stats.pendingSellers} />
          <StatCard label="Total Products" value={stats.totalProducts} />
          <StatCard label="Total Orders" value={stats.totalOrders} />
          <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
        </div>
      )}

      {tab === "sellers" && (
        <div className="space-y-3">
          {sellers.length === 0 ? (
            <p className="text-gray-500">No sellers yet.</p>
          ) : (
            sellers.map((s) => (
              <div key={s._id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.shopInfo?.shopName || s.name}</p>
                  <p className="text-sm text-gray-500">
                    {s.name} · {s.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      s.shopInfo?.isApproved ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {s.shopInfo?.isApproved ? "Approved" : "Pending"}
                  </span>
                  {s.shopInfo?.isApproved ? (
                    <button
                      onClick={() => handleApprove(s._id, false)}
                      className="text-sm border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50"
                    >
                      Revoke
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(s._id, true)}
                      className="text-sm bg-brand text-white px-3 py-1.5 rounded-lg hover:bg-brand-dark transition"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "products" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-100">
                {p.images?.[0]?.url && <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <h3 className="font-medium truncate">{p.name}</h3>
                <p className="text-xs text-gray-400">{p.seller?.shopInfo?.shopName || p.seller?.name}</p>
                <p className="text-brand font-bold mt-1">${p.discountPrice || p.price}</p>
                <p className="text-xs text-gray-400">
                  Stock: {p.stock} {!p.isActive && "· Inactive"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">
                    Buyer: {order.buyer?.name} · Seller: {order.seller?.shopInfo?.shopName || order.seller?.name}
                  </p>
                </div>
                <OrderStatusBadge status={order.orderStatus} />
              </div>
              <div className="flex justify-between items-center border-t mt-3 pt-3 text-sm">
                <span className="text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="font-bold">${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

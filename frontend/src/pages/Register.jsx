import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

const Register = () => {
  const [role, setRole] = useState("buyer");
  const [form, setForm] = useState({ name: "", email: "", password: "", shopName: "", shopDescription: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      if (user.role === "seller") navigate("/seller/dashboard");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">Create an account</h1>

      {/* Role toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          type="button"
          onClick={() => setRole("buyer")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
            role === "buyer" ? "bg-white shadow text-brand" : "text-gray-500"
          }`}
        >
          I'm a Buyer
        </button>
        <button
          type="button"
          onClick={() => setRole("seller")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
            role === "seller" ? "bg-white shadow text-brand" : "text-gray-500"
          }`}
        >
          I'm a Seller
        </button>
      </div>

      {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <PasswordInput name="password" required minLength={6} value={form.password} onChange={handleChange} />
        </div>

        {role === "seller" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
              <input
                name="shopName"
                required
                value={form.shopName}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Description</label>
              <textarea
                name="shopDescription"
                value={form.shopDescription}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
              Your seller account needs admin approval before you can list products.
            </p>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white py-2 rounded-lg font-medium hover:bg-brand-dark transition disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-sm text-center mt-6 text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-brand font-medium">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;

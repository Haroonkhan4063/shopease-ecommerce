import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "loading" | "sent" | "error"
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setStatus("sent");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-2 text-center">Forgot Password</h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        Enter your email and we'll send you a link to reset your password.
      </p>

      {status === "sent" ? (
        <p className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">
          If that email is registered, a reset link has been sent. Check your inbox (and spam folder).
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-brand text-white py-2 rounded-lg font-medium hover:bg-brand-dark transition disabled:opacity-50"
          >
            {status === "loading" ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}

      <p className="text-sm text-center mt-6 text-gray-600">
        Remembered it?{" "}
        <Link to="/login" className="text-brand font-medium">
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;

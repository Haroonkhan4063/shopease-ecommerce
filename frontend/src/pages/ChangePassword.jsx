import { useState } from "react";
import api from "../api/axios";
import PasswordInput from "../components/PasswordInput";

const ChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState(null); // { type: "success" | "error", text }
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMessage({ type: "success", text: "Password updated successfully." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Could not update password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">Change Password</h1>

      {message && (
        <p
          className={`text-sm p-3 rounded-lg mb-4 ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <PasswordInput name="currentPassword" required value={form.currentPassword} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <PasswordInput name="newPassword" required minLength={6} value={form.newPassword} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <PasswordInput
            name="confirmPassword"
            required
            minLength={6}
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white py-2 rounded-lg font-medium hover:bg-brand-dark transition disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;

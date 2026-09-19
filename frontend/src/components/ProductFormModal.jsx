import { useState } from "react";
import api from "../api/axios";

const emptyForm = { name: "", description: "", price: "", discountPrice: "", category: "", stock: "" };

const ProductFormModal = ({ product, onClose, onSaved }) => {
  const isEdit = !!product;
  const [form, setForm] = useState(
    isEdit
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          discountPrice: product.discountPrice || "",
          category: product.category,
          stock: product.stock,
        }
      : emptyForm
  );
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "" && value !== null) formData.append(key, value);
    });
    images.forEach((file) => formData.append("images", file));

    try {
      if (isEdit) {
        await api.put(`/products/${product._id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">{isEdit ? "Edit Product" : "Add New Product"}</h2>

        {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            placeholder="Product name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
          <textarea
            name="description"
            placeholder="Description"
            required
            rows={3}
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              required
              value={form.price}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />
            <input
              name="discountPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="Discount price (optional)"
              value={form.discountPrice}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />
            <input
              name="category"
              placeholder="Category"
              required
              value={form.category}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />
            <input
              name="stock"
              type="number"
              min="0"
              placeholder="Stock quantity"
              required
              value={form.stock}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {isEdit ? "Add more images (optional)" : "Product images"}
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files))}
              className="text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-2 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-brand text-white py-2 rounded-lg font-medium hover:bg-brand-dark transition disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;

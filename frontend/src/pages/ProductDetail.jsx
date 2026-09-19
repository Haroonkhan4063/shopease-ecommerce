import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { refreshCartCount } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const loadProduct = async () => {
    const { data } = await api.get(`/products/${id}`);
    setProduct(data.product);
  };

  const loadReviews = async () => {
    const { data } = await api.get(`/reviews/${id}`);
    setReviews(data.reviews);
  };

  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");
    if (user.role !== "buyer") {
      setMessage("Only buyers can add products to cart.");
      return;
    }
    try {
      await api.post("/cart", { productId: id, quantity });
      setMessage("Added to cart!");
      refreshCartCount();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add to cart");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reviews/${id}`, reviewForm);
      setReviewForm({ rating: 5, comment: "" });
      loadReviews();
      loadProduct();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not submit review");
    }
  };

  if (!product) return <p className="text-center py-20 text-gray-500">Loading...</p>;

  const price = product.discountPrice || product.price;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
          {product.images?.[0]?.url ? (
            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-400">{product.seller?.shopInfo?.shopName || product.seller?.name}</p>
          <h1 className="text-2xl font-bold mt-1">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            <span className="text-2xl font-bold text-brand">${price}</span>
            {product.discountPrice && <span className="text-gray-400 line-through">${product.price}</span>}
          </div>

          {product.numReviews > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              ⭐ {product.ratingsAverage} ({product.numReviews} reviews)
            </p>
          )}

          <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>
          <p className="text-sm text-gray-500 mt-2">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>

          {message && <p className="text-sm bg-blue-50 text-blue-700 p-2 rounded-lg mt-4">{message}</p>}

          <div className="flex items-center gap-3 mt-5">
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 border rounded-lg px-3 py-2"
            />
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-brand text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-dark transition disabled:opacity-50"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-14">
        <h2 className="text-xl font-bold mb-4">Reviews</h2>

        {user?.role === "buyer" && (
          <form onSubmit={handleReviewSubmit} className="bg-white p-4 rounded-xl shadow-sm mb-6 max-w-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1">Your rating</label>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              className="border rounded-lg px-3 py-2 mb-3"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <textarea
              required
              placeholder="Write your review..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-3"
              rows={3}
            />
            <button type="submit" className="bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-dark transition">
              Submit Review
            </button>
            <p className="text-xs text-gray-400 mt-2">You can only review products you've purchased.</p>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.buyer?.name}</span>
                  <span className="text-sm text-amber-500">{"⭐".repeat(r.rating)}</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

import { useState, useEffect } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";

const categories = ["All", "Electronics", "Clothing", "Home Goods"];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (targetPage = 1, search = keyword, cat = category) => {
    setLoading(true);
    try {
      const params = { page: targetPage, limit: 12 };
      if (search) params.keyword = search;
      if (cat && cat !== "All") params.category = cat;

      const { data } = await api.get("/products", { params });
      setProducts(data.products);
      setPage(data.page);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    fetchProducts(1, keyword, category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1, keyword, category);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Discover great products</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">From independent sellers, all in one place.</p>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2 max-w-md">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search products..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
        />
        <button
          type="submit"
          className="bg-brand text-white px-6 py-2.5 rounded-xl hover:bg-brand-dark shadow-sm hover:shadow transition font-medium"
        >
          Search
        </button>
      </form>

      <div className="flex gap-2 mb-8 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              category === c
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">
            Showing {products.length} of {total} products
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <Pagination page={page} pages={pages} onPageChange={(p) => fetchProducts(p, keyword, category)} />
        </>
      )}
    </div>
  );
};

export default Home;

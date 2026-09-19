import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const ProductCard = ({ product }) => {
  const price = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice;
  const discountPct = hasDiscount ? Math.round(100 - (product.discountPrice / product.price) * 100) : 0;

  return (
    <Link
      to={`/product/${product._id}`}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group border border-gray-50"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}
        {hasDiscount && (
          <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-full shadow-sm">
            -{discountPct}%
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1 truncate">
          {product.seller?.shopInfo?.shopName || product.seller?.name}
        </p>
        <h3 className="font-medium text-gray-900 truncate group-hover:text-brand transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-bold text-brand text-lg">${price}</span>
          {hasDiscount && <span className="text-sm text-gray-400 line-through">${product.price}</span>}
        </div>
        {product.numReviews > 0 && (
          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            {product.ratingsAverage} <span className="text-gray-400">({product.numReviews})</span>
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;

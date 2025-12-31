import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { formatVND } from "../../utils/formatVND";

const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white p-4 rounded-lg
                 border border-gray-300
                 hover:shadow-md transition
                 flex flex-col h-full"
    >
      {/* Image */}
      <div className="w-full h-48 mb-3 overflow-hidden rounded-lg">
        <img
          src={product.images?.[0]?.url || "/placeholder.jpg"}
          alt={product.name}
          className="w-full h-full object-contain
                     transition-transform duration-300
                     group-hover:scale-105"
        />
      </div>

      {/* Name */}
      <h3 className="font-medium text-md text-gray-900 line-clamp-2 min-h-[40px]">
        {product.name}
      </h3>

      {/* Rating */}
      <div className="flex items-center gap-1 mt-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.ceil(product.ratings)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">
          ({product.review_count})
        </span>
      </div>

      {/* Price */}
      <p className="mt-auto font-bold text-2xl">{formatVND(product.price)}</p>
    </Link>
  );
};

export default ProductCard;

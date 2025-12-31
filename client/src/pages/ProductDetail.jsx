import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, ShoppingCart, Minus, Plus, Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { fetchSingleProduct } from "../store/slices/productSlice";
import { addToCart } from "../store/slices/cartSlice";
import ReviewsContainer from "../components/Products/ReviewsContainer";
import { formatVND } from "../utils/formatVND";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const product = useSelector((state) => state.product.productDetails);
  const { loading, productReviews } = useSelector((state) => state.product);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Mô tả");

  useEffect(() => {
    dispatch(fetchSingleProduct(id));
  }, [dispatch, id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAddToCart = () => {
    dispatch(addToCart({ product_id: product.id, quantity }));
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="w-10 h-10 animate-spin" />
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <p className="text-xl font-semibold">Không tìm thấy sản phẩm</p>
      </div>
    );

  const averageRating =
    productReviews.length > 0
      ? (
          productReviews.reduce(
            (sum, review) => sum + Number(review.rating),
            0
          ) / productReviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="pt-24 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 rounded-xl shadow mb-10">
          {/* LEFT - IMAGE */}
          <div>
            <div className="border rounded-xl shadow-md p-4 bg-white mb-4">
              <img
                src={product.images?.[selectedImage]?.url}
                alt={product.name}
                className="w-full h-[420px] object-contain"
              />
            </div>

            <div className="flex gap-3">
              {product.images?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 border rounded-lg p-1 bg-white transition ${
                    selectedImage === index
                      ? "border-blue-600 ring-2 ring-blue-600"
                      : "border-gray-200 hover:border-primary"
                  }`}
                >
                  <img src={img.url} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT - INFO */}
          <div>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-3 text-sm">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.ceil(averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{averageRating}</span>
              <span className="text-gray-500">
                ({productReviews?.length} đánh giá)
              </span>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-primary mb-6">
              {formatVND(product.price)}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium">Số lượng:</span>
              <div className="flex items-center border rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity === 1}
                  className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 font-semibold border-l border-r">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(quantity + 1, product.stock))
                  }
                  disabled={quantity >= product.stock}
                  className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex items-center justify-center gap-2 py-3 border border-primary text-white rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <ShoppingCart size={18} /> Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white rounded-xl shadow">
          <div className="flex border-b">
            {["Mô tả", "Đánh giá"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium transition ${
                  activeTab === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "Mô tả" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Mô tả sản phẩm</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === "Đánh giá" && (
              <ReviewsContainer
                product={product}
                productReviews={productReviews}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

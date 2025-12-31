import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Filter, Star } from "lucide-react";

import { fetchAllProducts } from "../store/slices/productSlice";
import { fetchAllCategories } from "../store/slices/categorySlice";
import ProductCard from "../components/Products/ProductCard";
import Pagination from "../components/Products/Pagination";
import { formatVND } from "../utils/formatVND";

const Products = () => {
  const dispatch = useDispatch();
  const { products, totalProducts } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    searchParams.get("category") || ""
  );
  const [priceRange, setPriceRange] = useState(() => {
    const price = searchParams.get("price");
    return price ? price.split("-").map(Number) : [0, 99999999];
  });
  const [selectedRating, setSelectedRating] = useState(
    Number(searchParams.get("ratings")) || 0
  );

  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const searchQuery = searchParams.get("search") || "";

  // fetch categories
  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  // sync url
  useEffect(() => {
    const params = {};
    if (priceRange) params.price = `${priceRange[0]}-${priceRange[1]}`;
    if (currentPage > 1) params.page = currentPage;
    if (searchQuery) params.search = searchQuery;
    if (selectedCategoryId) params.category = selectedCategoryId;
    if (selectedRating) params.ratings = selectedRating;
    setSearchParams(params);
  }, [
    priceRange,
    currentPage,
    searchQuery,
    selectedCategoryId,
    selectedRating,
    setSearchParams,
  ]);

  // fetch products
  useEffect(() => {
    dispatch(
      fetchAllProducts({
        search: searchQuery,
        category: selectedCategoryId,
        price: `${priceRange[0]}-${priceRange[1]}`,
        ratings: selectedRating,
        page: currentPage,
      })
    );
  }, [
    dispatch,
    searchQuery,
    selectedCategoryId,
    priceRange,
    selectedRating,
    currentPage,
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, selectedCategoryId, selectedRating, priceRange]);

  useEffect(() => {
  setCurrentPage(1);
}, [selectedCategoryId, selectedRating, priceRange, searchQuery]);

  const totalPages = Math.ceil(totalProducts / 10);

  return (
    <div className="pt-24 min-h-screen bg-gray-100 max-w-7xl mx-auto px-4">
      <div className="">
        {/* MOBILE FILTER BUTTON */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-white border rounded-lg"
        >
          <Filter className="w-5 h-5" /> Lọc sản phẩm
        </button>

        <div className="flex gap-6">
          {/* OVERLAY MOBILE */}
          {isMobileFilterOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              onClick={() => setIsMobileFilterOpen(false)}
            />
          )}

          {/* SIDEBAR FILTER */}
          <aside
            className={`fixed lg:static top-0 left-0 z-40 lg:z-auto bg-white h-full overflow-y-auto lg:h-auto w-80 p-6 transition-transform duration-300 lg:translate-x-0 ${
              isMobileFilterOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <h2 className="text-xl font-bold mb-6">Bộ lọc</h2>

            {/* PRICE */}
            <div className="mb-8">
              <p className="font-semibold mb-3 text-gray-800">Khoảng giá</p>
              <input
                type="range"
                min="0"
                max="99999999"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="accent-blue-600 w-full"
              />
              <p className="text-sm mt-3 text-gray-600">
                Đến{" "}
                <span className="font-medium">{formatVND(priceRange[1])}</span>
              </p>
            </div>

            {/* RATING */}
            <div className="mb-8">
              <p className="font-semibold mb-3 text-gray-800">Đánh giá</p>
              {[5, 4, 3, 2, 1].map((r) => (
                <button
                  key={r}
                  onClick={() =>
                    setSelectedRating(selectedRating === r ? 0 : r)
                  }
                  className={`w-full flex items-center gap-2 px-3 py-2 mb-2 rounded-lg transition ${
                    selectedRating === r ? "bg-blue-200" : "hover:bg-blue-300"
                  }`}
                >
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < r ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </button>
              ))}
            </div>

            {/* CATEGORY */}
            <div>
              <p className="font-semibold mb-3 text-gray-800">Danh mục</p>
              <button
                onClick={() => setSelectedCategoryId("")}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition ${
                  !selectedCategoryId ? "bg-blue-200" : "hover:bg-blue-300"
                }`}
              >
                Tất cả
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition ${
                    selectedCategoryId === c.id
                      ? "bg-blue-200 font-medium"
                      : "hover:bg-blue-300"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </aside>

          {/* MAIN */}
          <main className="flex-1">
            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;

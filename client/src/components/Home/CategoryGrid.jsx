import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCategories } from "../../store/slices/categorySlice";
import { Loader } from "lucide-react";

const CategoryGrid = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="w-6 h-6 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <section className="my-16">
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Title */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900">
            Danh mục sản phẩm
          </h2>
          <p className="text-md text-gray-500 mt-1">
            Khám phá các nhóm sản phẩm phổ biến
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="border-blue-900 border rounded-xl p-4 text-center
                         hover:border-blue-500 hover:shadow-sm
                           group"
              >
                <p className="text-sm font-medium text-gray-800 group-hover:scale-110 ">
                  {category.name}
                </p>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-10">
              Không có danh mục nào
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;

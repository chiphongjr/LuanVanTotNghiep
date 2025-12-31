import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCategories } from "../store/slices/categorySlice";
import CreateCategoryModal from "../modals/CreateCategoryModal";
import UpdateCategoryModal from "../modals/UpdateCategoryModal";
// import Header from "./Header";
import { Edit, Trash2, Plus, LoaderCircle } from "lucide-react";
import { axiosInstance } from "../lib/axios";

const Categories = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [maxPage, setMaxPage] = useState(null);
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      const newMax = Math.ceil(categories.length / 10);
      setMaxPage(newMax || 1);
    }
  }, [categories]);

  useEffect(() => {
    if (maxPage && page > maxPage) {
      setPage(maxPage);
    }
  }, [page, maxPage]);

  const paginatedCategories = categories.slice((page - 1) * 10, page * 10);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/category/admin/delete/${categoryId}`);
      dispatch(fetchAllCategories());
      alert("Xóa danh mục thành công!");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi xóa danh mục");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
        <div className="flex-1 md:p-6">
          {/* <Header /> */}
          <h1 className="text-2xl font-bold">Tất cả danh mục</h1>
          <p className="text-sm text-gray-600 mb-6">
            Quản lý tất cả danh mục của bạn
          </p>

          <div className="p-4 sm:p-8 bg-gray-50">
            <div
              className={`overflow-x-auto rounded-lg ${
                loading
                  ? "p-10 shadow-none"
                  : categories && categories.length > 0
                  ? "shadow-lg"
                  : ""
              }`}
            >
              {loading ? (
                <div className="w-40 h-40 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : categories && categories.length > 0 ? (
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-blue-100 text-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left">Tên danh mục</th>
                      <th className="py-3 px-4 text-left">Ngày tạo</th>
                      <th className="py-3 px-4 text-left">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedCategories.map((category, index) => {
                      return (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="px-3 py-4 font-medium">
                            {category.name}
                          </td>

                          <td className="px-3 py-4 text-sm">
                            {new Date(category.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>

                          <td className="px-4 py-3 flex gap-2">
                            <button
                              className="text-white rounded-md cursor-pointer px-3 py-2 font-semibold bg-blue-gradient flex gap-2 items-center"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit size={16} />
                              Cập nhật
                            </button>

                            <button
                              className="text-white rounded-md cursor-pointer px-3 py-2 font-semibold bg-red-gradient flex gap-2 items-center"
                              onClick={() => handleDelete(category.id)}
                            >
                              {isDeleting &&
                              selectedCategory?.id === category.id ? (
                                <>
                                  <LoaderCircle className="w-4 h-4 animate-spin" />
                                  Đang xóa...
                                </>
                              ) : (
                                <>
                                  <Trash2 size={16} />
                                  Xóa
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <h3 className="text-2xl p-6 font-bold">
                  Không tìm thấy danh mục
                </h3>
              )}
            </div>

            {/* Pagination */}
            {!loading && categories.length > 0 && (
              <div className="flex justify-center mt-6 gap-4">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="px-4 py-2 text-gray-700">Trang {page}</span>
                <button
                  onClick={() => setPage((prev) => Math.max(prev + 1))}
                  disabled={maxPage === page}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 transition-all duration-300"
          title="Tạo danh mục mới"
        >
          <Plus size={20} />
        </button>

      {isCreateModalOpen && (
        <CreateCategoryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
      {isUpdateModalOpen && (
        <UpdateCategoryModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
        />
      )}
    </>
  );
};

export default Categories;

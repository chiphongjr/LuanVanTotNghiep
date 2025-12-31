import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCategory } from "../store/slices/categorySlice";
import { LoaderCircle, X } from "lucide-react";

const UpdateCategoryModal = ({ isOpen, onClose, category }) => {
  const { loading } = useSelector((state) => state.category);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name: category.name || "",
      });
    }
  }, [category, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name.trim());
    dispatch(updateCategory(category.id, data)).then(() => {
      onClose();
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">
          Cập nhật danh mục
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tên danh mục"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-6 rounded-lg font-medium transition"
            >
              {loading ? (
                <>
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật danh mục"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-6 rounded-lg font-medium transition"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCategoryModal;

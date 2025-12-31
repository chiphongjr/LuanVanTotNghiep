import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleUpdateProductModal } from "../store/slices/extraSlice";
import { LoaderCircle } from "lucide-react";
import { updateProduct } from "../store/slices/productsSlice";
import { fetchAllCategories } from "../store/slices/categorySlice";

const UpdateProductModal = ({ selectedProduct }) => {
  const { loading } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    stock: "",
  });
  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name || "",
        description: selectedProduct.description || "",
        price: selectedProduct.price || "",
        category_id: selectedProduct.category_id || "",
        stock: selectedProduct.stock || "",
      });
    }
  }, [selectedProduct]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.category_id) {
      alert("Vui lòng chọn danh mục");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category_id", formData.category_id);
    data.append("stock", formData.stock);

    // gửi ảnh nếu có
    if (formData.images) {
      for (let i = 0; i < formData.images.length; i++) {
        data.append("images", formData.images[i]);
      }
    }
    dispatch(updateProduct({ data, id: selectedProduct.id }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative">
        <button
          onClick={() => dispatch(toggleUpdateProductModal())}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Cập nhật sản phẩm
        </h2>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Tên sản phẩm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border px-4 py-2 rounded"
            required
          />
          <select
            className="w-full border p-2 rounded-lg"
            value={formData.category_id}
            onChange={(e) =>
              setFormData({ ...formData, category_id: e.target.value })
            }
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Giá"
            value={formData.price}
            onChange={(e) => {
              const value = e.target.value;
              // Chỉ cho phép số nguyên
              if (value === "" || /^[0-9]+$/.test(value)) {
                setFormData({ ...formData, price: value });
              }
            }}
            onKeyDown={(e) => {
              if (
                e.key === "." ||
                e.key === "-" ||
                e.key === "," ||
                e.key === "e"
              )
                e.preventDefault();
            }}
            className="border px-4 py-2 rounded"
          />
          <input
            type="number"
            placeholder="Tồn kho"
            value={formData.stock}
            onChange={(e) => {
              const value = e.target.value;
              // Chỉ cho phép số nguyên
              if (value === "" || /^[0-9]+$/.test(value)) {
                setFormData({ ...formData, stock: value });
              }
            }}
            onKeyDown={(e) => {
              if (
                e.key === "." ||
                e.key === "-" ||
                e.key === "," ||
                e.key === "e"
              )
                e.preventDefault();
            }}
            className="border px-4 py-2 rounded"
          />

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border px-4 py-2 rounded col-span-1 md:col-span-2"
            rows={4}
          />

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) =>
              setFormData({ ...formData, images: e.target.files })
            }
            className="border px-4 py-2 rounded col-span-1 md:col-span-2"
          />

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded col-span-1 md:col-span-2"
          >
            {loading ? (
              <>
                <LoaderCircle className="w-6 h-6 animate-spin" />
                Đang cập nhật
              </>
            ) : (
              "Cập nhật sản phẩm"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProductModal;

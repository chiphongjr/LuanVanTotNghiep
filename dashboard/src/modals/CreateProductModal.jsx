import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewProduct } from "../store/slices/productsSlice";
import { toggleCreateProductModal } from "../store/slices/extraSlice";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { fetchAllCategories } from "../store/slices/categorySlice";

const CreateProductModal = () => {
  const { createLoading } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const dispatch = useDispatch();
  // const [previewImages, setPreviewImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    stock: "",
    images: [],
  });

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category_id) {
      alert("Vui lòng chọn danh mục");
      return;
    }
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!formData.price || formData.price <= 0) {
      alert("Vui lòng nhập giá tối thiểu 20000d");
      return;
    }

    if (!formData.stock || formData.stock <= 0) {
      alert("Vui lòng nhập tồn kho lớn hơn 0");
      return;
    }

    if (formData.images.length === 0) {
      alert("Vui lòng tải ít nhất một hình ảnh");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category_id", formData.category_id);
    data.append("stock", formData.stock);

    for (let i = 0; i < formData.images.length; i++) {
      data.append("images", formData.images[i]);
    }

    dispatch(createNewProduct(data));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative">
          <button
            onClick={() => dispatch(toggleCreateProductModal())}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center">
            Thêm sản phẩm mới
          </h2>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="Tên sản phẩm"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
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
              required
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
              required
            />

            {/* <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files);

                setFormData({
                  ...formData,
                  images: files,
                });

                const previews = files.map((file) => URL.createObjectURL(file));
                setPreviewImages(previews);
              }}
              className="border px-4 py-2 rounded col-span-1 md:col-span-2"
              required
            />

            {previewImages && (
              <div className="grid grid-cols-1 md:grid-cols-2 col-span-6">
                {previewImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} alt="preview" />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...formData.images];
                        const newPreviews = [...previewImages];

                        newImages.splice(index, 1);
                        newPreviews.splice(index, 1);

                        setFormData({ ...formData, images: newImages });
                        setPreviewImages(newPreviews);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )} */}
            <input type="file" accept="images/*" multiple 
              onChange={(e)=>setFormData({...formData,images:Array.from(e.target.files)})}
              required
              className="border px-4 py-2 rounded col-span-1 md:col-span-2"
            />

            <textarea
              placeholder="Mô tả"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="border px-4 py-2 rounded col-span-1 md:col-span-2"
              rows={4}
            />

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded col-span-1 md:col-span-2"
            >
              {createLoading ? (
                <>
                  <LoaderCircle className="w-6 h-6 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Thêm sản phẩm"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateProductModal;

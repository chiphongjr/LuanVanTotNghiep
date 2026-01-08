import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleCreateDiscountModal } from "../store/slices/extraSlice";
import { createNewDiscount } from "../store/slices/discountSlice";

const CreateDiscountModal = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    code: "",
    value: "",
    start_date: "",
    end_date: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    dispatch(createNewDiscount(data));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Thêm mã giảm giá
          </h2>
          <button
            onClick={() => dispatch(toggleCreateDiscountModal())}
            className="text-gray-400 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Code */}
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Mã giảm giá
            </label>
            <input
              type="text"
              placeholder="VD: SALE10"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              className="w-full rounded-lg border px-4 py-2  "
              required
            />
          </div>

          {/* Value */}
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Giá trị giảm
            </label>
            <input
              type="number"
              placeholder="VD: 50000"
              value={formData.value}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^[0-9]+$/.test(value)) {
                  setFormData({ ...formData, value });
                }
              }}
              onKeyDown={(e) =>
                ["-", ".", "e", ","].includes(e.key) && e.preventDefault()
              }
              className="w-full rounded-lg border px-4 py-2  "
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-2  "
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-2  "
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => dispatch(toggleCreateDiscountModal())}
              className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700"
            >
              Tạo mã
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDiscountModal;

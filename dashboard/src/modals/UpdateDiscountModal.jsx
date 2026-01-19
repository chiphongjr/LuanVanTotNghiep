import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateDiscount } from "../store/slices/discountSlice";
import { toggleUpdateDiscountModal } from "../store/slices/extraSlice";
import { LoaderCircle } from "lucide-react";

const UpdateDiscountModal = ({ selectedDiscount }) => {
  const { loading } = useSelector((state) => state.discount);
  const [formData, setFormData] = useState({
    code: "",
    value: "",
    start_date: "",
    end_date: "",
  });
  const dispatch = useDispatch();
  useEffect(() => {
    const formatDate = (dateString) => {
      const d = new Date(dateString);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().split("T")[0];
    };

    setFormData({
      code: selectedDiscount.code || "",
      value: selectedDiscount.value || "",
      start_date: formatDate(selectedDiscount.start_date),
      end_date: formatDate(selectedDiscount.end_date),
    });
  }, [selectedDiscount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("code", formData.code),
      data.append("value", formData.value),
      data.append("start_date", formData.start_date),
      data.append("end_date", formData.end_date);

    dispatch(updateDiscount({ data, discountId: selectedDiscount.id }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative">
        <button
          onClick={() => dispatch(toggleUpdateDiscountModal())}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Cập nhật mã giảm giá
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            placeholder="Nhập mã giảm giá"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
            className="border rounded px-4 py-2"
          />

          <input
            type="number"
            value={formData.value}
            onChange={(e) => {
              const value = e.target.value;
              // Chỉ cho phép số nguyên
              if (value === "" || /^[0-9]+$/.test(value)) {
                setFormData({ ...formData, value: value });
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
            required
            className="border rounded px-4 py-2"
          />
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) =>
              setFormData({ ...formData, start_date: e.target.value })
            }
            required
            className="border rounded px-4 py-2"
          />
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) =>
              setFormData({ ...formData, end_date: e.target.value })
            }
            required
            className="border rounded px-4 py-2"
          />
          <button
            type="submit"
            className="bg-green-600 rounded flex items-center justify-center py-2 px-6 gap-2 text-white hover:bg-green-700 md:col-span-2 col-span-1"
          >
            {loading ? (
              <>
                <LoaderCircle className="w-6 h-6 animate-spin" />
                Đang cập nhật
              </>
            ) : (
              "Cập nhật mã giảm giá"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateDiscountModal;

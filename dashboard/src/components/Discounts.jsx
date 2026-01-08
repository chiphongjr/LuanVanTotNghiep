import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";

import { fetchAllDiscounts } from "../store/slices/discountSlice";
import { toggleCreateDiscountModal } from "../store/slices/extraSlice";
import CreateDiscountModal from "../modals/CreateDiscountModal";
import { formatVND } from "../../../client/src/utils/formatVND";

const Discounts = () => {
  const dispatch = useDispatch();

  const { discounts, loading } = useSelector((state) => state.discount);

  const { isCreateDiscountModalOpened } = useSelector((state) => state.extra);

  useEffect(() => {
    dispatch(fetchAllDiscounts());
  }, [dispatch]);

  return (
    <>
      <div className="flex-1 md:p-6">
        <h1 className="text-2xl font-bold">Tất cả mã giảm giá</h1>
        <p className="text-sm text-gray-600 mb-6">
          Quản lý tất cả mã giảm giá của bạn
        </p>

        <div className="p-4 sm:p-8 bg-gray-50">
          <div
            className={`overflow-x-auto rounded-lg ${
              loading
                ? "p-10"
                : discounts && discounts.length > 0
                ? "shadow-lg"
                : ""
            }`}
          >
            {/* Loading */}
            {loading ? (
              <div className="w-40 h-40 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : discounts && discounts.length > 0 ? (
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-blue-100 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Mã</th>
                    <th className="py-3 px-4 text-left">Giá trị</th>
                    <th className="py-3 px-4 text-left">Ngày bắt đầu</th>
                    <th className="py-3 px-4 text-left">Ngày kết thúc</th>
                    <th className="py-3 px-4 text-left">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {discounts.map((discount) => (
                    <tr key={discount.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">{discount.code}</td>

                      <td className="py-3 px-4">{formatVND(discount.value)}</td>

                      <td className="py-3 px-4">
                        {new Date(discount.start_date).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {new Date(discount.end_date).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>

                      <td className="px-4 py-3 flex gap-2">
                        <button className="px-3 py-2 rounded-md bg-blue-gradient text-white font-semibold">
                          Cập nhật
                        </button>

                        <button className="px-3 py-2 rounded-md bg-red-gradient text-white font-semibold">
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <h3 className="text-2xl p-6 font-bold">
                Không tìm thấy mã giảm giá
              </h3>
            )}
          </div>
        </div>
      </div>

      {/* Floating button */}
      <button
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50"
        onClick={() => dispatch(toggleCreateDiscountModal())}
        title="Tạo mã giảm giá"
      >
        <Plus size={20} />
      </button>

      {isCreateDiscountModalOpened && <CreateDiscountModal />}
    </>
  );
};

export default Discounts;

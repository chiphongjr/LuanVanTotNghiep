import React from "react";
import { useSelector } from "react-redux";

const TopSellingProducts = () => {
  const { topSellingProducts } = useSelector((state) => state.admin);

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-md overflow-x-auto xl:col-span-2 max-h-[440px] scrollbar-hide">
        <h2 className="text-lg font-semibold mb-2">Top sản phẩm</h2>
        <p className="text-sm text-gray-500 mb-4">Sản phẩm bán nhiều nhất</p>

        <table className="min-w-[600px] w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2">Ảnh</th>
              <th className="px-4 py-2">Chủ đề</th>
              <th className="px-4 py-2">Danh mục</th>
              <th className="px-4 py-2">Tổng sản phẩm đã bán</th>
              <th className="px-4 py-2">Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            {topSellingProducts.length > 0 &&
              topSellingProducts.map((element, index) => {
                return (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">
                      <img
                        src={element.image}
                        alt={element.name}
                        className="w-12 h-12 object-contain rounded-md"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold">{element.name}</td>
                    <td className="px-4 py-3 font-semibold">
                      {element.category_name}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {element.total_sold}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {element.ratings} ⭐
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TopSellingProducts;

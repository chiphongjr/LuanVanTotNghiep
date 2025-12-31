import React from "react";
import {
  Wallet,
  PackageCheck,
  TrendingUp,
  AlertTriangle,
  BarChart4,
  UserPlus,
} from "lucide-react";
import { useSelector } from "react-redux";
import { formatVND } from "../../utils/formatVND";

const MiniSummary = () => {
  const {
    topSellingProducts,
    lowStockProducts,
    revenueGrowth,
    newUsersThisMonth,
    currentMonthSales,
    orderStatusCounts,
  } = useSelector((state) => state.admin);

  let totalOrders = 0;
  totalOrders = Object.values(orderStatusCounts).reduce(
    (acc, count) => acc + count,
    0
  );

  const summary = [
    {
      text: "Tổng doanh thu tháng này",
      subText: `Tháng này bán được: ${formatVND(currentMonthSales)}`,
      icon: <Wallet className="text-green-600" />,
    },
    {
      text: "Tổng đơn hàng đã tạo",
      subText: `Tổng đơn hàng: ${totalOrders}`,
      icon: <PackageCheck className="text-blue-600" />,
    },
    {
      text: "Sản phẩm bán chạy",
      subText: `Sản phẩm bán nhiều nhất ${topSellingProducts[0]?.name} / Đã bán: ${topSellingProducts[0]?.total_sold}`,
      icon: <TrendingUp className="text-emerald-600" />,
    },
    {
      text: "Sắp hết hàng",
      subText: `${lowStockProducts} sản phẩm sắp hết trong kho`,
      icon: <AlertTriangle className="text-red-600" />,
    },
    {
      text: "Lợi nhuận tăng trưởng",
      subText: `Lợi nhuận ${
        revenueGrowth.includes("+") ? "tăng" : "giảm"
      } ${revenueGrowth} so với tháng trước`,
      icon: <BarChart4 className="text-purple-600" />,
    },
    {
      text: "Người dùng mới tháng này",
      subText: `Người dùng mới: ${newUsersThisMonth}`,
      icon: <UserPlus className="text-yellow-600" />,
    },
  ];

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-lg font-semibold mb-2">Bản tóm tắt</h2>
        <p className="text-sm text-gray-500 mb-4">
          Tóm tắt thông số tháng hiện tại
        </p>
        <div className="space-y-4">
          {summary.map((item, index) => {
            return (
              <div key={index} className="flex items-center space-x-3">
                {item.icon}
                <div>
                  <p className="text-sm">{item.start}</p>
                  <p className="text-sm text-gray-500">{item.subText}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MiniSummary;

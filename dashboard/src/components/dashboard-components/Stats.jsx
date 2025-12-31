import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {formatVND} from "../../utils/formatVND.js"

const Stats = () => {
  const [revenueChange, setRevenueChange] = useState("");
  const {
    totalUsersCount,
    todayRevenue,
    yesterdayRevenue,
    totalRevenueAllTime,
  } = useSelector((state) => state.admin);

  
  useEffect(() => {
    let change =
      yesterdayRevenue === 0
        ? 100
        : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
    const revenueChangeText = `${
      change >= 0 ? "+" : "-"
    }${change.toFixed()}% từ ngày hôm qua`;
    setRevenueChange(revenueChangeText);
  }, []);

  const stats = [
    {
      title: "Doanh thu hôm nay",
      value: formatVND(todayRevenue),
      change: revenueChange,
    },

    {
      title: "Tổng người dùng",
      value: totalUsersCount || 0,
      change: null,
    },
    {
      title: "Doanh thu tất cả thời gian",
      value: formatVND(totalRevenueAllTime),
      change: null,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          return (
            <div
              key={index}
              className={`bg-white p-4 rounded-xl shadow-md ${
                index !== 0 && "flex gap-2 flex-col"
              }`}
            >
              <div className="text-sm text-gray-500">{stat.title}</div>
              <div
                className={`text-xl font-semibold ${
                  index !== 0 && "text-[30px] overflow-y-hidden"
                }`}
              >
                {stat.value}
              </div>

              {stat.change && (
                <div
                  className={`text-sm ${
                    stat.change.startsWith("+")
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {stat.change} so với kì trước
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Stats;

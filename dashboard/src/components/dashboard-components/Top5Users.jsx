import React from "react";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatVND } from "../../utils/formatVND.js";
const Top5Users = () => {
  const { top5Users } = useSelector((state) => state.admin);

  const CustomYAxisTick = ({ x, y, payload }) => {
    return (
      <foreignObject x={x - 36} y={y - 16} width={32} height={32}>
        <img
          src={payload.value}
          alt="users"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </foreignObject>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const user = payload[0].payload;
      return (
        <div className="bg-white p-2 rounded shadow border text-sm">
          <p className="font-semibold">Tên: {user.name}</p>
          <p>Chi tiêu: {formatVND(Number(user.total_spent))}</p>
          <p>Số đơn: {user.total_orders}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="font-semibold mb-2">Top 5 người dùng</h3>
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={top5Users}
              layout="vertical"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                dataKey="avatar.url"
                type="category"
                tick={<CustomYAxisTick />}
                width={50}
              />
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ pointerEvents: "auto" }}
              />
              <Bar
                dataKey="total_spent"
                radius={[4, 4, 4, 4]}
                isAnimationActive={false}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
              >
                {top5Users.map((_, index) => {
                  return (
                    <Cell
                      key={index}
                      fill={
                        index === 0 ? "blue" : index === 1 ? "purple" : "red"
                      }
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default Top5Users;

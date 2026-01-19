import { useSelector } from "react-redux";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

const OrdersChart = () => {
  const { orderStatusCounts } = useSelector((state) => state.admin);

  const statusColors = {
    Processing: "blue", // yellow
    Shipped: "yellow", // blue
    Delivered: "#22c55e", // green
    Cancelled: "#ef4444", // red
  };
  const orderStatusData = Object.keys(orderStatusCounts).map((status) => ({
    status,
    count: parseInt(orderStatusCounts[status]),
  }));

  const labelStatus={
    Processing:"Chờ xử lý",
    Delivered:"Đã giao",
    Shipped:"Đang giao",
    Cancelled:"Đã hủy",
  }
  

  return (
    <>
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="font-semibold mb-2">Trạng thái đơn hàng</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={orderStatusData}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {orderStatusData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={statusColors[entry.status] || "#ccc"} // fallback color
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-2">
          {orderStatusData.map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <span
                className="w-5 h-3 rounded-sm"
                style={{ backgroundColor: statusColors[item.status] }}
              />
              <span>
                {labelStatus[item.status]}: {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default OrdersChart;

import { useSelector } from "react-redux";
import {
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getLastNMonths } from "../../lib/helper";
import { formatVND } from "../../utils/formatVND";

const MonthlySalesChart = () => {
  const { monthlySales } = useSelector((state) => state.admin);

  const months = getLastNMonths(12);

  const filled = months.map(({ date, label }) => {
    const found = monthlySales?.find((item) => {
      const itemDate = new Date(item.month);
      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth()
      );
    });

    return {
      month: label,
      totalSales: found?.totalsales || 0,
    };
  });

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h3 className="font-semibold mb-2">Doanh thu hàng tháng</h3>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={filled}>
          <XAxis dataKey="month" interval={0} />
          <YAxis width={95} tickFormatter={(v) => formatVND(v)} />
          <Tooltip formatter={(v) => formatVND(v)} />

          <Bar dataKey="totalSales" fill="blue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlySalesChart;

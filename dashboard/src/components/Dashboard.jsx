// import Header from "./Header";
import MiniSummary from "./dashboard-components/MiniSummary";
import TopSellingProducts from "./dashboard-components/TopSellingProducts";
import Stats from "./dashboard-components/Stats";
import MonthlySalesChart from "./dashboard-components/MonthlySalesChart";
import OrdersChart from "./dashboard-components/OrdersChart";
import TopProductsChart from "./dashboard-components/TopProductsChart";

const Dashboard = () => {
  return (
    <div className="space-y-6">
  <h1 className="text-2xl font-bold">Dashboard</h1>

  <Stats />

  <div className="grid grid-cols-1">
    <MonthlySalesChart />
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <OrdersChart />
    <TopProductsChart />
  </div>

  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <TopSellingProducts />
    <MiniSummary />
  </div>
</div>

  );
};

export default Dashboard;


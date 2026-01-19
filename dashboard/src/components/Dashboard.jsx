// import Header from "./Header";
import MiniSummary from "./dashboard-components/MiniSummary";
import TopSellingProducts from "./dashboard-components/TopSellingProducts";
import Stats from "./dashboard-components/Stats";
import MonthlySalesChart from "./dashboard-components/MonthlySalesChart";
import OrdersChart from "./dashboard-components/OrdersChart";
// import TopProductsChart from "./dashboard-components/TopProductsChart";
import Top5Users from "./dashboard-components/Top5Users";
// import { useState } from "react";

// import {axiosInstance} from "../lib/axios.js"

const Dashboard = () => {
  // const [fromDate,setFromDate]=useState("");
  // const [toDate,setToDate]=useState("");
  // const [totals,setTotals]=useState(null);
  
  // const handleClick=async ()=>{
  //  const res= await axiosInstance.post("/admin/from-date-to-date",{fromDate,toDate})

  //  setTotals(res.data.totalFromDateToDate)

  // }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <Stats />

    {/* <input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)}/>
    <input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)}/>

    <button onClick={handleClick} className="bg-red-500">Ok</button>
    {totals !=null && (
      <p className="bg-green-500">{totals}</p>
    )} */}

      <div className="grid grid-cols-1">
        <MonthlySalesChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OrdersChart />
        <Top5Users />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <TopSellingProducts />
        <MiniSummary />
      </div>

      {/* <div className="grid grid-cols-1">
      <TopProductsChart />

  </div> */}
    </div>
  );
};

export default Dashboard;

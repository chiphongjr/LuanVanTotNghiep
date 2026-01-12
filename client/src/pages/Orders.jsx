import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Filter, Package, Truck, CheckCircle, XCircle } from "lucide-react";

import { fetchMyOrders } from "../store/slices/orderSlice";
import { formatVND } from "../utils/formatVND";
import { axiosInstance } from "../lib/axios";

import { toast } from "react-toastify";

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const { myOrders } = useSelector((state) => state.order);
  const { authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);
  if (!authUser) navigate("/products");

  const handleCancelOrder = (orderId) => {
    const isConfirmed = window.confirm(
    "Bạn có chắc chắn muốn hủy đơn hàng này không?"
  );

  if (!isConfirmed) return; 
    try {
      axiosInstance.post(`/order/cancel-order/${orderId}`);
      toast.success("Hủy đặt hàng thành công");
      dispatch(fetchMyOrders());
    } catch (error) {
      toast.error(error.response?.data?.message, "Hủy đặt hàng thất bại");
    }
  };

  const filterOrders = myOrders.filter(
    (order) => statusFilter === "all" || order.order_status === statusFilter
  );
  const statusArray = [
    "all",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Processing":
        return <Package className="w-5 h-5 text-yellow-500" />;
      case "Shipped":
        return <Truck className="w-5 h-5 text-blue-500" />;
      case "Delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Processing":
        return "bg-yellow-500/20 text-yellow-400";
      case "Shipped":
        return "bg-blue-500/20 text-blue-400";
      case "Delivered":
        return "bg-green-500/20 text-green-400";
      case "Cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusString = (status) => {
    switch (status) {
      case "Processing":
        return "Chờ xử lý";
      case "Shipped":
        return "Đang giao";
      case "Delivered":
        return "Đã giao";
      case "Cancelled":
        return "Đã hủy";
      default:
        return "Tất cả";
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Đơn hàng của tôi</h1>
        <p className="text-gray-600 ground mb-6">
          Theo dõi và quản lý lịch sử đặt hàng của bạn
        </p>

        {/* STATUS FILTER */}
        <div className="bg-white border rounded-lg p-4 mb-8 flex flex-wrap gap-2 items-center">
          <Filter className="w-5 h-5 text-primary" />
          <span className="font-medium">Lọc theo trạng thái: </span>
          {statusArray.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                statusFilter === status
                  ? "bg-blue-600 text-white"
                  : " bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {getStatusString(status)}
            </button>
          ))}
        </div>

        {/* ORDER LIST */}
        {filterOrders.length === 0 ? (
          <div className="text-center bg-white border rounded-lg max-w-md mx-auto p-6">
            <Package className="w-16 h-16 text-gray-600 ground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Không tìm thấy đơn hàng
            </h2>
            <p className="text-gray-600 ground">
              {statusFilter === "all"
                ? "Bạn chưa từng đặt hàng?"
                : `Không có đơn hàng với trạng thái "${statusFilter}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filterOrders.map((order) => (
              <div key={order.id} className="bg-white border rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Đơn hàng #{order.id}
                    </h3>
                    <p className="text-gray-600 ground">
                      Đặt ngày{" "}
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.order_status)}
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium capitalize ${getStatusColor(
                          order.order_status
                        )}`}
                      >
                        {getStatusString(order.order_status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 ground">Tổng tiền</p>
                      <p className="text-xl font-bold text-black">
                        {formatVND(order.final_price)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ITEMS */}
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-contain rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.title}</h4>
                        <p className="text-sm text-gray-600 ground">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatVND(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                  {order.order_status === "Delivered" && (
                    <button
                      className="px-4 py-2 text-sm text-gray-800 bg-green-500 hover:bg-green-600 rounded-xl"
                      onClick={() =>
                        navigate(`/product/${order.order_items[0].product_id}`)
                      }
                    >
                      Đánh giá
                    </button>
                  )}

                  {order.order_status === "Processing" && (
                    <button
                      className="px-4 py-2 text-sm text-gray-200 bg-red-500 hover:bg-red-600 rounded-xl"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Hủy đặt hàng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

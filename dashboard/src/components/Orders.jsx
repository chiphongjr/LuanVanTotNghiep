import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import Header from "./Header";
import { formatVND } from "../utils/formatVND.js";
import { fetchAllOrders, updateOrderStatus } from "../store/slices/orderSlice";

const Orders = () => {
  // Dùng cho select lọc tổng đơn hàng (có All)
  const statusArray = [
    "All",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
  // Dùng cho select trạng thái từng đơn hàng (không có All)
  const orderStatusOptions = [
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const getStatusString = (status) => {
    switch (status) {
      case "Processing":
        return "Chờ xử lý";
      case "Shipped":
        return "Đang giao hàng";
      case "Delivered":
        return "Đã giao";
      case "Cancelled":
        return "Đã hủy";
      default:
        return "Tất cả";
    }
  };

  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);

  const [selectedStatus, setSelectedStatus] = useState({});
  const [filterByStatus, setFilterByStatus] = useState("All");
  const [_previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleStatusChange = (orderId, newStatus) => {
    setSelectedStatus((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }));
    dispatch(updateOrderStatus({ orderId, status: newStatus }));
  };

  const filteredOrders =
    filterByStatus === "All"
      ? orders
      : orders?.filter((order) => order.order_status === filterByStatus);

  if (loading) return <p className="p-10 text-center">Đang tải đơn hàng...</p>;

  return (
    <div>
      {/* header  */}

      <div>
        {/* <Header /> */}
        <h1 className="text-2xl font-bold">Tất cả đơn hàng</h1>
        <p className="text-sm text-gray-600 mb-6">Quản lý đơn hàng của bạn</p>
      </div>

      {/* select lọc trạng thái luôn hiển thị */}
      <div className="flex justify-between items-center p-6">
        <select
          className="p-2 border rounded shadow-sm"
          onChange={(e) => setFilterByStatus(e.target.value)}
          value={filterByStatus}
        >
          {statusArray.map((status) => (
            <option key={status} value={status}>
              {getStatusString(status)}
            </option>
          ))}
        </select>
      </div>

      {/* hiển thị đơn hàng hoặc thông báo */}
      {filteredOrders.length === 0 ? (
        <h3 className="text-2xl font-bold p-6">Không có đơn hàng nào</h3>
      ) : (
        filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow-lg rounded-lg p-6 mb-6 transition-all"
          >
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <p>
                  <strong>Mã đơn hàng: </strong>
                  {order.id}
                </p>
                <p>
                  <strong>Tình trạng: </strong>
                  {getStatusString(order.order_status)}
                </p>
                <p>
                  <strong>Ngày đặt: </strong>
                  {new Date(order.created_at).toLocaleString("vi-VN")}
                </p>
                <p>
                  <strong>Tổng doanh thu: </strong>
                  {formatVND(order.final_price)}
                </p>
              </div>

              <div>
                <select
                  value={selectedStatus[order.id] || order.order_status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  disabled={
                    order.order_status === "Cancelled" ||
                    order.order_status === "Delivered"
                  }
                  className={`border-2 p-2 rounded mb-2 ${
                    order.order_status === "Cancelled" ||
                    order.order_status === "Delivered"
                      ? "bg-gray-200 cursor-not-allowed opacity-70"
                      : ""
                  }`}
                >
                  {orderStatusOptions
                    .filter((status) => {
                      if (order.order_status === "Shipped") {
                        return status !== "Processing";
                      } else if (order.order_status === "Processing") {
                        return status !== "Delivered";
                      }
                      return true;
                    })
                    .map((status) => (
                      <option key={status} value={status}>
                        {getStatusString(status)}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-lg mb-1">
                Thông tin giao hàng
              </h4>
              <p>
                <strong>Tên: </strong>
                {order.shipping_info.full_name}
              </p>
              <p>
                <strong>SDT: </strong>
                {order.shipping_info?.phone}
              </p>
              <p>
                <strong>Địa chỉ: </strong>
                {order.shipping_info?.address}, {order.shipping_info?.ward_name},{order.shipping_info?.district_name},{order.shipping_info?.province_name}
              </p>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-lg mb-2">Sản phẩm đã đặt</h4>
              {Array.isArray(order.order_items) &&
                order.order_items.map((item) => (
                  <div
                    key={item.order_id}
                    className="flex items-center gap-4 mb-2 border-b pb-2"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-contain cursor-pointer"
                        onClick={() => setPreviewImage(item.image)}
                      />
                    )}
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p>
                        <strong>Số lượng: </strong>
                        {item.quantity} | <strong>Giá: </strong>{" "}
                        {formatVND(item.price)} | <strong>Tổng tiền: </strong>{" "}
                        {formatVND(item.quantity * item.price)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;

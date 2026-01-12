import { useState, useEffect } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import PaymentForm from "../components/PaymentForm";
import { placeOrder } from "../store/slices/orderSlice";
import { clearCart, getCart } from "../store/slices/cartSlice";
import { formatVND } from "../utils/formatVND";
import { resetOrder } from "../store/slices/orderSlice";
import { axiosInstance } from "../lib/axios";

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { authUser } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { paymentIntent, placingOrder, orderId } = useSelector((state) => state.order);

  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);

  const [stripePromise, setStripePromise] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [province, setProvince] = useState(null);
  const [district, setDistrict] = useState(null);
  const [ward, setWard] = useState(null);

  const [shippingFee, setShippingFee] = useState(0);

  const [paymentType, setPaymentType] = useState("Online");


  

  const [shippingDetails, setShippingDetails] = useState({
    full_name: "",
    phone: "",
    address: "",
    province_id: "",
    province_name: "",

    district_id: "",
    district_name: "",

    ward_code: "",
    ward_name: "",
  });

  useEffect(() => {
    dispatch(resetOrder());
  }, [dispatch]);

  /* ================= LOAD STRIPE ================= */
  useEffect(() => {
    loadStripe(
      "pk_test_51SU2CJH79ro1HXFCaXHFSUB4swsYmTWBSVg3Bi2ClsGdxajL0VJvX8y6xFoDa4mmOvx80P8fNyQBzq5AynH8UIP400dPQVANHl"
    ).then(setStripePromise);
  }, []);

  useEffect(() => {
    if (authUser) dispatch(getCart());
  }, [authUser, dispatch]);

  const total = cart.cart_items.reduce(
    (sum, item) => sum + item.product_price * item.cart_item_quantity,
    0
  );
  useEffect(() => {
    if (discountInfo && discountInfo.value >= total) {
      alert("Mã giảm giá không áp dụng cho đơn này");
      setDiscountInfo(null);
    }
  }, [discountInfo, total]);

  useEffect(() => {
    axiosInstance.get("/shipping/provinces").then((res) => {
      setProvinces(res.data.provinces);
    });
  }, []);

  useEffect(() => {
    if (!province) return;

    setDistrict(null);
    setWard(null);
    setDistricts([]);
    setWards([]);
    setShippingFee(0);

    axiosInstance
      .get("/shipping/districts", {
        params: { province_id: province.ProvinceID },
      })
      .then((res) => setDistricts(res.data.districts));

    setShippingDetails((prev) => ({
      ...prev,
      province_id: province.ProvinceID,
      province_name: province.ProvinceName,
    }));
  }, [province]);

  useEffect(() => {
    if (!district) return;

    setWard(null);
    setWards([]);
    setShippingFee(0);

    axiosInstance
      .get("/shipping/wards", {
        params: { district_id: district.DistrictID },
      })
      .then((res) => setWards(res.data.wards));

    setShippingDetails((prev) => ({
      ...prev,
      district_id: district.DistrictID,
      district_name: district.DistrictName,
    }));
  }, [district]);

  useEffect(() => {
    if (!district || !ward) return;

    axiosInstance
      .post("/shipping/fee", {
        district_id: district.DistrictID,
        ward_code: ward.WardCode,
        total_price: total,
      })
      .then((res) => {
        setShippingFee(res.data.shipping_fee);

        setShippingDetails((prev) => ({
          ...prev,
          ward_code: ward.WardCode,
          ward_name: ward.WardName,

        }));
      });
  }, [ward]);

 useEffect(() => {
  // COD: đặt hàng xong, KHÔNG có paymentIntent
  if (
    !placingOrder &&
    orderId &&
    paymentIntent === null &&
    paymentType === "COD"
  ) {
    dispatch(clearCart());
    navigate("/"); // 👈 về trang chủ
  }
}, [placingOrder, orderId, paymentIntent, paymentType, dispatch, navigate]);

  if (!authUser) {
    navigate("/products");
    return null;
  }

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    dispatch(
      placeOrder({
        full_name: shippingDetails.full_name,
        phone: shippingDetails.phone,
        address: shippingDetails.address,
        orderedItems: cart.cart_items,
        discount_code: discountInfo?.code,
        province_id: shippingDetails.province_id,
        province_name: shippingDetails.province_name,

        district_id: shippingDetails.district_id,
        district_name: shippingDetails.district_name,

        ward_code: shippingDetails.ward_code,
        ward_name: shippingDetails.ward_name,

        shipping_fee: shippingFee,


        payment_type: paymentType, // 👈 THÊM
        
      })
    );
  };

  const handleApplyDiscount = async () => {
    try {
      const res = await axiosInstance.post("/discount/validate-discount", {
        code: discountCode,
        order_total: total,
      });

      setDiscountInfo(res.data.discount);
    } catch (error) {
      alert(error.response?.data?.message || "Áp dụng mã giảm giá thất bại");
    }
  };

  const discountValue = discountInfo?.value || 0;

  const finalTotal = Math.max(total - discountValue + shippingFee, 0);

  return (
    <div className="min-h-screen pt-24 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* ================= HEADER ================= */}
          {/* <div className="flex items-center mb-8">
            <Link
              to="/cart"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại giỏ hàng
            </Link>
          </div> */}

          {/* ================= CONTENT ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ========== LEFT ========== */}
            <div className="lg:col-span-2">
              {!paymentIntent && (
                <form
                  onSubmit={handlePlaceOrder}
                  className="bg-white rounded-xl shadow p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">
                    Thông tin giao hàng
                  </h2>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Họ và tên
                    </label>
                    <input
                      required
                      value={shippingDetails.full_name}
                      onChange={(e) =>
                        setShippingDetails({
                          ...shippingDetails,
                          full_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Số điện thoại
                      </label>
                      <input
                        required
                        value={shippingDetails.phone}
                        onChange={(e) =>
                          setShippingDetails({
                            ...shippingDetails,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Thành phố
                      </label>
                      <select
                        className="w-full px-4 py-3 border rounded-lg"
                        value={province?.ProvinceID || ""}
                        required
                        onChange={(e) =>
                          setProvince(
                            provinces.find(
                              (p) => p.ProvinceID == e.target.value
                            )
                          )
                        }
                      >
                        <option value="">-- Chọn Tỉnh / Thành phố --</option>
                        {provinces.map((p) => (
                          <option key={p.ProvinceID} value={p.ProvinceID}>
                            {p.ProvinceName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Quận/Huyện
                      </label>
                      <select
                        className="w-full px-4 py-3 border rounded-lg"
                        disabled={!province}
                        value={district?.DistrictID || ""}
                        required
                        onChange={(e) =>
                          setDistrict(
                            districts.find(
                              (d) => d.DistrictID == e.target.value
                            )
                          )
                        }
                      >
                        <option value="">-- Chọn Quận / Huyện --</option>
                        {districts.map((d) => (
                          <option key={d.DistrictID} value={d.DistrictID}>
                            {d.DistrictName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phường/Xã
                      </label>
                      <select
                        className="w-full px-4 py-3 border rounded-lg"
                        disabled={!district}
                        value={ward?.WardCode || ""}
                        required
                        onChange={(e) =>
                          setWard(
                            wards.find((w) => w.WardCode == e.target.value)
                          )
                        }
                      >
                        <option value="">-- Chọn Phường / Xã --</option>
                        {wards.map((w) => (
                          <option key={w.WardCode} value={w.WardCode}>
                            {w.WardName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">
                      Địa chỉ
                    </label>
                    <input
                      required
                      value={shippingDetails.address}
                      onChange={(e) =>
                        setShippingDetails({
                          ...shippingDetails,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  </div>

                  <div className="mt-6">
  <label className="block text-sm font-medium mb-2">
    Phương thức thanh toán
  </label>

  <div className="flex gap-4">
    <label className="flex items-center gap-2">
      <input
        type="radio"
        value="Online"
        checked={paymentType === "Online"}
        onChange={() => setPaymentType("Online")}
      />
      Thanh toán Online
    </label>

    <label className="flex items-center gap-2">
      <input
        type="radio"
        value="COD"
        checked={paymentType === "COD"}
        onChange={() => setPaymentType("COD")}
      />
      Thanh toán khi nhận hàng (COD)
    </label>
  </div>
</div>


                  <button
                    type="submit"
                    className="w-full mt-6 py-4 text-lg font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Tiếp tục thanh toán
                  </button>
                </form>

              )} {/* STRIPE PAYMENT */}
  {paymentIntent && paymentType === "Online" && (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  )}
            </div>

            {/* ========== RIGHT ========== */}
            <div>
              <div className="bg-white rounded-xl shadow p-6 sticky top-28">
                <h3 className="text-lg font-semibold mb-4">
                  Thông tin đơn hàng
                </h3>

                <div className="space-y-4 mb-6">
                  {cart.cart_items.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-12 h-12 object-contain rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          x {item.cart_item_quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3">
                  {!paymentIntent && (
                    <>
                      <input
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="Nhập mã giảm giá (VD: TEST)"
                        className="w-full px-3 py-2 border rounded"
                      />

                      <button
                        onClick={handleApplyDiscount}
                        className="mt-2 w-full bg-green-600 text-white py-2 rounded"
                      >
                        Áp dụng
                      </button>
                    </>
                  )}

                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{formatVND(total)}</span>
                  </div>

                  {discountInfo && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({discountInfo.code})</span>
                      <span>- {formatVND(discountInfo.value)}</span>
                    </div>
                  )}

                  {shippingFee > 0 && (
                    <div className="flex justify-between">
                      <span>Phí vận chuyển</span>
                      <span>{formatVND(shippingFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Thanh toán</span>
                    <span>{formatVND(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* =========================== */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

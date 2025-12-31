import { useState, useEffect } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import PaymentForm from "../components/PaymentForm";
import { placeOrder } from "../store/slices/orderSlice";
import { getCart } from "../store/slices/cartSlice";
import { formatVND } from "../utils/formatVND";
import { resetOrder } from "../store/slices/orderSlice";

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { authUser } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { paymentIntent } = useSelector((state) => state.order);

  const [stripePromise, setStripePromise] = useState(null);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    city: "",
    phone: "",
    address: "",
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

  if (!authUser) {
    navigate("/products");
    return null;
  }

  const total = cart.cart_items.reduce(
    (sum, item) => sum + item.product_price * item.cart_item_quantity,
    0
  );

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    dispatch(
      placeOrder({
        full_name: shippingDetails.fullName,
        city: shippingDetails.city,
        phone: shippingDetails.phone,
        address: shippingDetails.address,
        orderedItems: cart.cart_items,
      })
    );
  };

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
              {!paymentIntent ? (
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
                      value={shippingDetails.fullName}
                      onChange={(e) =>
                        setShippingDetails({
                          ...shippingDetails,
                          fullName: e.target.value,
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
                        required
                        value={shippingDetails.city}
                        onChange={(e) =>
                          setShippingDetails({
                            ...shippingDetails,
                            city: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border rounded-lg"
                      >
                        <option value="">---Chọn thành phố---</option>
                        <option>Thành phố Hồ Chí Minh</option>
                        <option>Thành phố Biên Hòa</option>
                        <option>Thành Phố Long An</option>
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

                  <button
                    type="submit"
                    className="w-full mt-6 py-4 text-lg font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Tiếp tục thanh toán
                  </button>
                </form>
              ) : (
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
                  <div className="flex justify-between text-lg font-semibold border-t pt-3">
                    <span>Tổng thanh toán</span>
                    <span className="text-primary">{formatVND(total)}</span>
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

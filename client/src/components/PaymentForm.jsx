import { useEffect, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CreditCard, CreditCardIcon, Lock, X } from "lucide-react";
import { toast } from "react-toastify";

import { clearCart } from "../store/slices/cartSlice";
import { cancelOrderPayment, resetOrder } from "../store/slices/orderSlice";
import { axiosInstance } from "../lib/axios";

const PaymentForm = () => {
  const clientSecret = useSelector((state) => state.order.paymentIntent);
  const orderId = useSelector((state) => state.order.orderId); // Lưu orderId vào orderSlice khi tạo đơn
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!clientSecret) navigate("/payment");
  }, [clientSecret, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage("");

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card: cardElement } }
      );

      if (error) {
        toast.error("Thanh toán thất bại");
        setErrorMessage(error.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        try {
          await axiosInstance.post("/order/confirm-payment", {
            paymentIntentId: paymentIntent.id,
          });
        } catch (err) {
          console.error("Server confirm payment failed", err);
        }

        toast.success("Thanh toán thành công");
        dispatch(clearCart());
        dispatch(resetOrder());
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Có lỗi xảy ra, vui lòng thử lại.");
    }

    setIsProcessing(false);
  };

  const handleCancelPayment = () => {
    if (!orderId) return;
    dispatch(cancelOrderPayment({ orderId }));
    navigate("/cart");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded-xl shadow"
    >
      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <CreditCardIcon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold">Thanh toán online</h2>
      </div>

      {/* ===== STRIPE INFO (QUAN TRỌNG) ===== */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
        Hệ thống sử dụng <b>Stripe</b> (demo).
        <br />
        Hỗ trợ <b>Visa / MasterCard</b>.
        <br />
        <b>Thẻ test:</b>
        <ul className="list-disc ml-5 mt-1">
          <li>4242 4242 4242 4242</li>
          <li>MM/YY: 04/44 – CVC: 444 - ZIP: 44444</li>
        </ul>
      </div>

      {/* ===== CARD INPUT ===== */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">
          Thông tin thẻ *
        </label>
        <div className="border rounded-lg px-4 py-3">
          <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
        </div>
      </div>

      {/* ===== SECURITY NOTE ===== */}
      <div className="flex items-center gap-2 mb-5 p-3 bg-gray-50 rounded">
        <Lock className="w-5 h-5 text-green-600" />
        <span className="text-sm text-gray-600">
          Thông tin thẻ được mã hóa và bảo mật
        </span>
      </div>

      {/* ===== SUBMIT ===== */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
      >
        {isProcessing ? "Đang xử lý..." : "Hoàn tất thanh toán"}
      </button>

      {/* ===== CANCEL ===== */}
      <button
        type="button"
        onClick={handleCancelPayment}
        className="w-full mt-3 py-3 bg-red-600 text-white rounded-lg flex justify-center items-center gap-2"
      >
        <X className="w-4 h-4" />
        Hủy thanh toán
      </button>

      {errorMessage && (
        <p className="mt-4 text-sm text-red-500">{errorMessage}</p>
      )}
    </form>
  );
};

export default PaymentForm;

import { Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../store/slices/cartSlice";
import { formatVND } from "../utils/formatVND";

const Cart = () => {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authUser) dispatch(getCart());
  }, [authUser, dispatch]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const cartItems = cart?.cart_items || [];

  const total = cartItems.reduce(
    (sum, item) => sum + item.product_price * item.cart_item_quantity,
    0
  );

  const cartItemCount = cartItems.reduce(
    (sum, item) => sum + item.cart_item_quantity,
    0
  );

  if (cartItems.length === 0)
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <h1 className="text-xl font-semibold mb-2">
            Giỏ hàng của bạn đang trống
          </h1>
          <p className="text-gray-500 mb-6">
            Vui lòng thêm sản phẩm trước khi thanh toán
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Xem sản phẩm
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen pt-24 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT - CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.cart_item_id}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <Link to={`/product/${item.product_id}`}>
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-28 h-28 object-contain rounded-lg border shadow-md"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link
                      to={`/product/${item.product_id}`}
                      className="hover:text-primary"
                    >
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {item.product_name}
                      </h3>
                    </Link>
                    <p className="text-blue-600 font-bold mt-2">
                      {formatVND(item.product_price)}
                    </p>
                  </div>
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() =>
                        dispatch(
                          updateCartItem({
                            cart_item_id: item.cart_item_id,
                            quantity: Math.max(1, item.cart_item_quantity - 1),
                          })
                        )
                      }
                      disabled={item.cart_item_quantity === 1}
                      className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-semibold border-l border-r">
                      {item.cart_item_quantity}
                    </span>
                    <button
                      onClick={() =>
                        dispatch(
                          updateCartItem({
                            cart_item_id: item.cart_item_id,
                            quantity: Math.min(
                              item.cart_item_quantity + 1,
                              item.product_stock
                            ),
                          })
                        )
                      }
                      disabled={item.cart_item_quantity >= item.product_stock}
                      className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-semibold">
                      {formatVND(item.product_price * item.cart_item_quantity)}
                    </p>
                    <button
                      onClick={() =>
                        dispatch(removeCartItem(item.cart_item_id))
                      }
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT - SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow p-6 sticky top-28">
              <h2 className="text-lg font-semibold mb-6">Thông tin đơn hàng</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Tổng sản phẩm</span>
                  <span>{cartItemCount}</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-lg font-semibold">
                  <span>Tổng tiền</span>
                  <span className="text-black font-bold">
                    {formatVND(total)}
                  </span>
                </div>
              </div>
              {authUser && (
                <Link
                  to="/payment"
                  className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold mb-4"
                >
                  Thanh toán
                </Link>
              )}
              <Link
                to="/products"
                className="block w-full text-center py-3 rounded-xl border font-semibold text-gray-600 hover:bg-gray-300"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

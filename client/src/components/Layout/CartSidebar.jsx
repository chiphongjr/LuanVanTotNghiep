// import { X, Plus, Minus, Trash2 } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { removeCartItem, updateCartItem } from "../../store/slices/cartSlice";
// import { toggleCart } from "../../store/slices/popupSlice";
// import { Link } from "react-router-dom";

// const CartSidebar = () => {
//   const dispatch = useDispatch();
//   const { isCartOpen } = useSelector((state) => state.popup);
//   const { cart } = useSelector((state) => state.cart);

//   const updateQuantity = (id, quantity) => {
//     if (quantity <= 0) dispatch(removeCartItem(id));
//     else dispatch(updateCartItem(id, quantity));
//   };

//   if (!isCartOpen) return null;

//   let total = 0;
//   if (cart?.items) total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

//   return (
//     <>
//       <div className="fixed inset-0 bg-black/30 z-40" onClick={() => dispatch(toggleCart())} />
//       <div className="fixed right-0 top-0 h-full w-80 bg-white z-50 shadow overflow-y-auto">
//         <div className="flex items-center justify-between p-4 border-b">
//           <h2 className="font-semibold text-lg">Giỏ hàng</h2>
//           <button onClick={() => dispatch(toggleCart())} className="p-2 rounded hover:bg-gray-200">
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="p-4">
//           {cart?.items?.length === 0 ? (
//             <div className="text-center py-12">
//               <p>Giỏ hàng trống</p>
//               <Link to="/products" onClick={() => dispatch(toggleCart())} className="mt-2 inline-block text-blue-600">
//                 Xem sản phẩm
//               </Link>
//             </div>
//           ) : (
//             <>
//               {cart.items.map((item) => (
//                 <div key={item.product.id} className="flex items-center gap-3 mb-4 border-b pb-2">
//                   <img src={item.product.images[0].url} alt={item.product.name} className="w-16 h-16 object-cover" />
//                   <div className="flex-1">
//                     <h3 className="font-medium">{item.product.name}</h3>
//                     <p>${item.product.price}</p>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 border rounded">
//                       <Minus className="w-4 h-4" />
//                     </button>
//                     <span>{item.quantity}</span>
//                     <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 border rounded">
//                       <Plus className="w-4 h-4" />
//                     </button>
//                     <button onClick={() => dispatch(removeCartItem(item.product.id))} className="p-1 border rounded text-red-500">
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//               <div className="mt-4 border-t pt-2 flex justify-between font-semibold">
//                 <span>Tổng:</span>
//                 <span>${total.toFixed(2)}</span>
//               </div>
//               <Link to="/cart" onClick={() => dispatch(toggleCart())} className="mt-4 block text-center bg-blue-600 text-white py-2 rounded">
//                 Xem giỏ hàng & thanh toán
//               </Link>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default CartSidebar;

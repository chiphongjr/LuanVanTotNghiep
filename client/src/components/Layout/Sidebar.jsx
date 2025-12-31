import { X, Home, Package, ShoppingCart, List } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../../store/slices/popupSlice";

const Sidebar = () => {
  const { authUser } = useSelector((state) => state.auth);
  const { isSidebarOpen } = useSelector((state) => state.popup);
  const dispatch = useDispatch();

  if (!isSidebarOpen) return null;

  const menuItems = [
    { name: "Trang chủ", icon: Home, path: "/" },
    { name: "Sản phẩm", icon: Package, path: "/products" },
    { name: "Giỏ hàng", icon: ShoppingCart, path: "/cart" },
    authUser && { name: "Đơn hàng của tôi", icon: List, path: "/orders" },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-20"
        onClick={() => dispatch(toggleSidebar())}
      />
      <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow z-30">
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="font-bold">Menu</span>
        </div>
        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {menuItems.filter(Boolean).map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={() => dispatch(toggleSidebar())}
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100"
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

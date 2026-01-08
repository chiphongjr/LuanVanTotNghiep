import {
  LayoutDashboard,
  ListOrdered,
  Package,
  Users,
  // User,
  LogOut,
  BookText,
  X,
  BadgeDollarSign,
} from "lucide-react";
import { NavLink, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { logout } from "../store/slices/authSlice";
import { toggleNavbar } from "../store/slices/extraSlice";

const SideBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isNavbarOpened } = useSelector((state) => state.extra);
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" />;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const links = [
    { icon: <LayoutDashboard />, title: "Bảng điều khiển", path: "/dashboard" },
    { icon: <ListOrdered />, title: "Đơn hàng", path: "/orders" },
    { icon: <BookText />, title: "Danh mục", path: "/categories" },
    { icon: <Package />, title: "Sản phẩm", path: "/products" },
    { icon: <Users />, title: "Tất cả người dùng", path: "/users" },
    { icon: <BadgeDollarSign />, title: "Khuyến mãi", path: "/discounts" },
    // { icon: <User />, title: "Thông tin", path: "/profile" },
  ];

  return (
    <>
      {/* OVERLAY MOBILE */}
      {isNavbarOpened && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => dispatch(toggleNavbar())}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50
          h-full w-64 bg-white shadow-lg
          flex flex-col justify-between p-4
          transform transition-transform duration-300
          ${isNavbarOpened ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <nav className="space-y-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <X
              className="md:hidden cursor-pointer"
              onClick={() => dispatch(toggleNavbar())}
            />
          </div>

          {links.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => dispatch(toggleNavbar())}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md
                ${isActive ? "bg-black text-white" : "hover:bg-gray-100"}`
              }
            >
              {item.icon}
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2
          px-3 py-2 rounded-md text-white bg-red-500 hover:bg-red-600"
        >
          <LogOut /> Logout
        </button>
      </aside>
    </>
  );
};

export default SideBar;

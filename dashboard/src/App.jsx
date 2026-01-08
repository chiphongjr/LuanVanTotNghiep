import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu } from "lucide-react";

import { getUser } from "./store/slices/authSlice";
import { fetchAllProducts } from "./store/slices/productsSlice";
import { getDashboardStats } from "./store/slices/adminSlice";
import { toggleNavbar } from "./store/slices/extraSlice";

import SideBar from "./components/SideBar";

// Pages
import Dashboard from "./components/Dashboard";
import Orders from "./components/Orders";
import Products from "./components/Products";
import Categories from "./components/Categories";
import Users from "./components/Users";
import Profile from "./components/Profile";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import Discounts from "./components/Discounts";

const App = () => {
  const dispatch = useDispatch();
  const { authChecked, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAllProducts());
      dispatch(getDashboardStats());
    }
  }, [isAuthenticated, dispatch]);

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN ROUTE */}
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            {/* ADMIN LAYOUT */}
            <Route
              path="*"
              element={
                <div className="flex h-screen overflow-hidden bg-gray-100">
                  {/* MOBILE MENU BUTTON */}
                  {user?.role === "Admin" && (
                    <button
                      className="fixed top-4 left-4 z-40 p-2 bg-white shadow rounded-md md:hidden"
                      onClick={() => dispatch(toggleNavbar())}
                    >
                      <Menu />
                    </button>
                  )}

                  {/* SIDEBAR */}
                  {user?.role === "Admin" && <SideBar />}

                  {/* MAIN CONTENT */}
                  <main className="flex-1 overflow-y-auto">
                    <div className="p-6 max-w-7xl mx-auto">
                      <Routes>
                        <Route
                          path="/"
                          element={<Navigate to="/dashboard" />}
                        />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/discounts" element={<Discounts />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route
                          path="*"
                          element={<Navigate to="/dashboard" />}
                        />
                      </Routes>
                    </div>
                  </main>
                </div>
              }
            />
          </>
        )}
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;

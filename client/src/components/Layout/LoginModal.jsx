import { useState, useEffect } from "react";
import { X, Mail, Lock, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toggleAuthPopup } from "../../store/slices/popupSlice";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
} from "../../store/slices/authSlice";

const LoginModal = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { authUser, isSigningUp, isLoggingIn, isRequestingForToken } =
    useSelector((state) => state.auth);

  const { isAuthPopupOpen } = useSelector((state) => state.popup);

  const [mode, setMode] = useState("signin");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  useEffect(() => {
    if (location.pathname.startsWith("/password/reset")) {
      setMode("reset");
      dispatch(toggleAuthPopup());
    }
  }, [location.pathname, dispatch]);

  useEffect(() => {
    resetForm();
  }, [mode]);

  useEffect(() => {
    if (authUser) {
      resetForm();
      setMode("signin");
    }
  }, [authUser]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);
    if (mode === "signup") data.append("name", formData.name);

    if (mode === "forgot") {
      dispatch(forgotPassword({ email: formData.email })).then(() => {
        dispatch(toggleAuthPopup());
        setMode("signin");
      });
      return;
    }

    if (mode === "reset") {
      const token = location.pathname.split("/").pop();
      dispatch(
        resetPassword({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        })
      );
      return;
    }

    if (mode === "signup") dispatch(register(data));
    else dispatch(login(data));
  };

  if (!isAuthPopupOpen || authUser) return null;

  let isLoading = isSigningUp || isLoggingIn || isRequestingForToken;
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* overlay */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
          {/* header  */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-600">
              {mode === "reset"
                ? "Đổi mật khẩu"
                : mode === "signup"
                ? "Tạo tài khoản"
                : mode === "forgot"
                ? "Quên mật khẩu"
                : "Chào mừng đến JrShop"}
            </h2>

            <button
              onClick={() => dispatch(toggleAuthPopup())}
              className="p-2 rounded hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* authentication form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* fullname - only for signup*/}
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* email - always visibile except reset mode   */}
            {mode !== "reset" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* Password - always visible except forgot mode */}
            {mode !== "forgot" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/*confirm Password - always visible for reset mode */}
            {mode === "reset" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Xác thực mật khẩu"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* forgot password toggle button/link */}
            {/* {mode === "signin" && (
              <div className="text-right text-sm">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-primary hover:text-accent animate-smooth"
                >
                  Quên mật khẩu
                </button>
              </div>
            )} */}

            {/* submit button  */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold flex justify-center items-center gap-2 ${
                isLoading
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {mode === "reset"
                      ? "Đổi mật khẩu..."
                      : mode === "signup"
                      ? "Tạo tài khoản..."
                      : mode === "forgot"
                      ? "Đợi gửi mã đến email..."
                      : "Đăng nhập..."}
                  </span>
                </>
              ) : mode === "reset" ? (
                "Đổi mật khẩu"
              ) : mode === "signup" ? (
                "Tạo tài khoản"
              ) : mode === "forgot" ? (
                "Gửi mã reset email"
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* mode toggle */}
          {["signin", "signup"].includes(mode) && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode((prev) => (prev === "signup" ? "signin" : "signup"));
                }}
                className="text-blue-600 hover:underline"
              >
                {mode === "signup"
                  ? "Đã có tài khoản? Đăng nhập"
                  : "Chưa có tài khoản? Đăng ký"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginModal;

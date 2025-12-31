import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { resetPassword } from "../store/slices/authSlice";

const ResetPassword = () => {
  const { token } = useParams();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    e.preventDefault();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const dispatch = useDispatch();
  const handleSubmit = (e) => {
    e.preventDefault();
    const data=new FormData();
    data.append("password",formData.password)
    data.append("confirmPassword",formData.confirmPassword)
    dispatch(resetPassword(data, token));
  };


  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (isAuthenticated && user.role === "Admin") {
    return <Navigate to="/" />;
  }


  return (
    <>
      <div className="'min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to bg-purple-200 px-4">
        <div className="bg-white shadow-lg rounded-2xl max-w-md w-full p-8 sm:p-10">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Đổi mật khẩu
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="p-2">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu mới
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Nhập mật khẩu mới"
                className="w-full py-3 border border-gray-300 rounded-xl"
              />
            </div>

            <div className="p-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nhập lại mật khẩu
              </label>
              <input
                type="passowrd"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Nhập lại mật khẩu"
                className="w-full py-3 border border-gray-300 rounded-xl"
              />
            </div>

            

            <div className="px-2">
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 bg-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang đổi mật khẩu...</span>
                  </>
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;

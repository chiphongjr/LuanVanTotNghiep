import React, { useState } from "react";
// import Header from "./Header";
import { useDispatch, useSelector } from "react-redux";
import {
  updateAdminPassword,
  updateAdminProfile,
} from "../store/slices/authSlice";

const Profile = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [avatar, setAvatar] = useState(null);
  const [updatingSection, setUpdatingSection] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  };

  const handleProfileChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const dispatch = useDispatch();

  const updateProfile = () => {
    const formData = new FormData();
    formData.append("name", editData.name);
    formData.append("email", editData.email);
    formData.append("avatar", avatar);
    setUpdatingSection("Password");

    dispatch(updateAdminProfile(formData));
  };

  const updatePassword = () => {
    const formData = new FormData();
    formData.append("currentPassword", passwordData.currentPassword);
    formData.append("newPassword", passwordData.newPassword);
    formData.append("confirmNewPassword", passwordData.confirmNewPassword);
    dispatch(updateAdminPassword(formData));
  };

  return (
    <>
      {/* header  */}
      <div className="flex-1 md:p-6 mb:pb-0">
        {/* <Header /> */}
        <h1 className="text-2xl font-bold">Thông tin</h1>
        <p className="text-sm text-gray-600 mb-6">Quản lý trang cá nhân</p>
      </div>

      {/* content  */}
      <div className=" md:px-4 py-8">
        {/* profile card  */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 mb-10">
          <img
            src={(user && user?.avatar?.url) || avatar}
            alt={user?.name || avatar}
            className="w-32 h-32 rounded-full object-cover border"
            loading="lazy"
          />
          <div>
            <p className="text-xl font-medium">Tên: {user.name}</p>
            <p className="text-md text-gray-600">Email: {user.email}</p>
            <p className="text-sm text-blue-500">Vai trò: {user.role}</p>
          </div>
        </div>

        {/* update profile section  */}
        <div className="bg-gray-100 p-6 rounded-2xl shadow-md mb-10">
          <h3 className="text-xl font-semibold mb-4">Cập nhật thông tin</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleProfileChange}
              className="p-2 border rounded-md"
              placeholder="Tên của bạn"
            />
            <input
              type="email"
              name="email"
              value={editData.email}
              onChange={handleProfileChange}
              className="p-2 border rounded-md"
              placeholder="Email của bạn"
            />
            <input
              type="file"
              name="avatar"
              onChange={handleAvatarChange}
              className="p-2 border rounded-md col-span-1 md:col-span-2"
            />
          </div>
          <button
            onClick={updateProfile}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 mt-4 rounded-xl transition"
            disabled={loading}
          >
            {loading && updatingSection === "Profile" ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Cập nhật thông tin...</span>
              </>
            ) : (
              "Cập nhật thông tin"
            )}
          </button>
        </div>

        {/* update password section  */}
        <div className="bg-gray-100 p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-4">Cập nhật mật khẩu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              name="currentPassword"
              onChange={handlePasswordChange}
              value={passwordData.currentPassword}
              className="p-2 border rounded-md"
              placeholder="Mật khẩu hiện tại"
            />
            <input
              type="password"
              name="newPassword"
              onChange={handlePasswordChange}
              value={passwordData.newPassword}
              className="p-2 border rounded-md"
              placeholder="Mật khẩu mới"
            />
            <input
              type="password"
              name="confirmPassword"
              onChange={handlePasswordChange}
              value={passwordData.confirmPassword}
              className="p-2 border rounded-md"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          <button
            onClick={updatePassword}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 mt-4 rounded-xl transition"
            disabled={loading}
          >
            {loading && updatingSection === "Profile" ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Cập nhật mật khẩu...</span>
              </>
            ) : (
              "Cập nhật mật khẩu"
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Profile;

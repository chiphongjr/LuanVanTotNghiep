import { X, LogOut, Upload, Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { toggleAuthPopup } from "../../store/slices/popupSlice";
import {
  logout,
  updateProfile,
  updatePassword,
} from "../../store/slices/authSlice";

const ProfilePanel = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { isAuthPopupOpen } = useSelector((state) => state.popup);

  const [name, setName] = useState(authUser?.name || "");
  const [email, setEmail] = useState(authUser?.email || "");
  const [avatar, setAvatar] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    if (authUser) {
      setName(authUser.name || "");
      setEmail(authUser.email || "");
    }
  }, [authUser]);

  if (!isAuthPopupOpen || !authUser) return null;

  const handleProfileUpdate = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (avatar) formData.append("avatar", avatar);
    dispatch(updateProfile(formData));
  };

  const handlePasswordUpdate = () => {
    const formData = new FormData();
    formData.append("password", currentPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmNewPassword", confirmNewPassword);
    dispatch(updatePassword(formData));
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={() => dispatch(toggleAuthPopup())}
      />
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Trang cá nhân</h2>
          <button onClick={() => dispatch(toggleAuthPopup())}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-4">
          <img
            src={authUser.avatar?.url || "/avatar-holder.avif"}
            alt={authUser.name}
            className="w-20 h-20 mx-auto rounded-full mb-2"
          />
          <h3 className="font-medium">{authUser.name}</h3>
          <p className="text-sm">{authUser.email}</p>
        </div>

        {/* Update info */}
        <div className="space-y-2 mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Họ và tên"
            className="w-full border px-2 py-1 rounded"
          />
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border px-2 py-1 rounded"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" /> Upload avatar
            <input
              type="file"
              onChange={(e) => setAvatar(e.target.files[0])}
              className="hidden"
            />
          </label>
          <button
            onClick={handleProfileUpdate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Lưu thay đổi
          </button>
        </div>

        {/* Update password */}
        <div className="space-y-2 mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu hiện tại"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="text-sm text-blue-600"
          >
            {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          </button>
          <button
            onClick={handlePasswordUpdate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Cập nhật mật khẩu
          </button>
        </div>

        <button
          onClick={() => dispatch(logout())}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
        >
          Đăng xuất
        </button>
      </div>
    </>
  );
};

export default ProfilePanel;

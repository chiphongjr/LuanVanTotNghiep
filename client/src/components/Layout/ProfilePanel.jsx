import { X, LogOut, Upload, Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { toggleAuthPopup } from "../../store/slices/popupSlice";
import {
  logout,
  updateProfile,
  updatePassword,
} from "../../store/slices/authSlice";
import { axiosInstance } from "../../lib/axios";

const ProfilePanel = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { isAuthPopupOpen } = useSelector((state) => state.popup);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [province, setProvince] = useState(null);
  const [district, setDistrict] = useState(null);
  const [ward, setWard] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: null,
    phone: "",
    address: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  useEffect(() => {
    if (authUser) {
      setProfile((prev) => ({
        ...prev,
        name: authUser.name || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        address: authUser.address || "",
      }));
    }
  }, [authUser]);

  useEffect(() => {
    if(!authUser) return;
    const p = {
      ProvinceID: authUser.province_id||"",
      ProvinceName: authUser.province_name||"",
    };
    setProvince(p || "");

    const d = {
      DistrictID: authUser.district_id||"",
      DistrictName: authUser.district_name||"",
    };
    setDistrict(d || "");

    const w = {
      WardCode: authUser.ward_code||"",
      WardName: authUser.ward_name||"",
    };
    setWard(w || "");
  }, []);

  useEffect(() => {
    axiosInstance
      .get("/shipping/provinces")
      .then((res) => setProvinces(res.data.provinces));
  }, []);

  useEffect(() => {
    if (!province) return;

    setDistricts([]);
    setWards([]);

    axiosInstance
      .get("/shipping/districts", {
        params: { province_id: province.ProvinceID },
      })
      .then((res) => setDistricts(res.data.districts));
  }, [province]);

  useEffect(() => {
    if (!district) return;

    setWards([]);

    axiosInstance
      .get("/shipping/wards", {
        params: { district_id: district.DistrictID },
      })
      .then((res) => setWards(res.data.wards));
  }, [district]);

  if (!isAuthPopupOpen || !authUser) return null;

  const handleProfileUpdate = () => {
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("email", profile.email);
    formData.append("phone", profile.phone);
    formData.append("address", profile.address);
    formData.append("province_id", province.ProvinceID);
    formData.append("province_name", province.ProvinceName);
    formData.append("district_id", district.DistrictID);
    formData.append("district_name", district.DistrictName);
    formData.append("ward_code", ward.WardCode);
    formData.append("ward_name", ward.WardName);
    if (profile.avatar) formData.append("avatar", profile.avatar);
    dispatch(updateProfile(formData));
  };

  const handlePasswordUpdate = () => {
    const formData = new FormData();
    formData.append("password", passwordForm.currentPassword);
    formData.append("newPassword", passwordForm.newPassword);
    formData.append("confirmNewPassword", passwordForm.confirmNewPassword);
    dispatch(updatePassword(formData));
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={() => dispatch(toggleAuthPopup())}
      />
      <div className="fixed right-0 top-0 h-screen w-80 bg-white shadow-lg z-50 p-4 overflow-y-auto">
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
            value={profile.name}
            onChange={(e) => {
              setProfile((prev) => ({ ...prev, name: e.target.value }));
            }}
            placeholder="Họ và tên"
            className="w-full border px-2 py-1 rounded"
          />
          <input
            type="text"
            value={profile.email}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="Email"
            className="w-full border px-2 py-1 rounded"
          />
          <input
            type="text"
            value={profile.phone}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="SDT"
            className="w-full border px-2 py-1 rounded"
          />

          <select
            className="w-full px-4 py-3 border rounded-lg"
            value={province?.ProvinceID || ""}
            required
            onChange={(e) =>
              setProvince(provinces.find((p) => p.ProvinceID == e.target.value))
            }
          >
            <option value="">Thành Phố/Tỉnh</option>
            {provinces.map((p) => (
              <option key={p.ProvinceID} value={p.ProvinceID}>
                {p.ProvinceName}
              </option>
            ))}
          </select>

          <select
            className="w-full px-4 py-3 border rounded-lg"
            value={district?.DistrictID || ""}
            required
            onChange={(e) =>
              setDistrict(districts.find((d) => d.DistrictID == e.target.value))
            }
          >
            <option value="">Quận/Huyện</option>
            {districts.map((d) => (
              <option key={d.DistrictID} value={d.DistrictID}>
                {d.DistrictName}
              </option>
            ))}
          </select>

          <select
            className="w-full px-4 py-3 border rounded-lg"
            value={ward?.WardCode || ""}
            required
            onChange={(e) =>
              setWard(wards.find((w) => w.WardCode == e.target.value))
            }
          >
            <option value="">Phường/Xã</option>
            {wards.map((w) => (
              <option key={w.WardCode} value={w.WardCode}>
                {w.WardName}
              </option>
            ))}
          </select>

          <input
            required
            placeholder="Địa chỉ"
            value={profile.address}
            className="w-full px-4 py-3 border"
            type="text"
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, address: e.target.value }))
            }
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" /> Upload avatar
            <input
              type="file"
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, avatar: e.target.files[0] }))
              }
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
            value={passwordForm.current}
            onChange={(e) => setPasswordForm(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu mới"
            value={passwordForm.new}
            onChange={(e) => setPasswordForm(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu"
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm(e.target.value)}
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

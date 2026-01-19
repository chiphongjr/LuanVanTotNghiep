import database from "../database/db.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { generateEmailTemplate } from "../utils/generateForgotPasswordEmailTemplate.js";
import { generateResetPasswordToken } from "../utils/generateResetPasswordToken.js";
import { sendToken } from "../utils/jwtToken.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("Vui lòng điền đầy đủ thông tin", 400));
  }
  if (req.body.password.length < 8 || req.body.password.length > 16)
    return next(new ErrorHandler("Mật khẩu phải từ 8 đến 16 kí tự", 400));
  const isExistingEmail = await database.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  if (isExistingEmail.rows.length > 0) {
    return next(new ErrorHandler("Email đã tồn tại", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await database.query(
    "INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING *",
    [name, email, hashedPassword]
  );
  sendToken(user.rows[0], 201, "Đăng kí tài khoản thành công", res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("Vui lòng điền đầy đủ thông tin", 400));

  const user = await database.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (user.rows.length === 0)
    return next(new ErrorHandler("Sai tài khoản hoặc mật khẩu", 401));

  if (user.rows[0].status === "blocked")
    return next(new ErrorHandler("Tài khoản của bạn đã bị khóa", 401));

  const isMatchPassword = await bcrypt.compare(password, user.rows[0].password);

  if (!isMatchPassword)
    return next(new ErrorHandler("Sai tài khoản hoặc mật khẩu", 401));
  sendToken(user.rows[0], 200, "Đăng nhập thành công", res);
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await database.query("SELECT * FROM users WHERE id=$1", [
    req.user.id,
  ]);

  res.status(200).json({ success: true, user: user.rows[0] });
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";

  res
    .clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    })
    .status(200)
    .json({
      success: true,
      message: "Đăng xuất thành công",
    });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const { frontendUrl } = req.query;

  const result = await database.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  if (result.rows.length === 0)
    return next(new ErrorHandler("Email không tồn tại", 404));

  const user = result.rows[0];

  const { hashedToken, resetPasswordExpireTime, resetToken } =
    generateResetPasswordToken();

  await database.query(
    `UPDATE users SET reset_password_token=$1, reset_password_expire=to_timestamp($2) WHERE id=$3`,
    [hashedToken, resetPasswordExpireTime / 1000, user.id]
  );

  const resetUrl = `${frontendUrl}/password/reset/${resetToken}`;

  const html = generateEmailTemplate(resetUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "Khôi phục mật khẩu",
      message: html,
    });

    return res.status(200).json({
      success: true,
      message: "Gửi email khôi phục thành công",
    });
  } catch (error) {
    console.log(error);

    await database.query(
      `UPDATE users SET reset_password_token=null, reset_password_expire=null WHERE id=$1`,
      [user.id]
    );

    return next(new ErrorHandler("Không thể gửi email", 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await database.query(
    "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expire > NOW()",
    [resetPasswordToken]
  );
  if (user.rows.length === 0)
    return next(
      new ErrorHandler("Không tồn tại hoặc hết hạn reset token", 400)
    );
  if (
    req.body.password?.length < 8 ||
    req.body.password?.length > 16 ||
    req.body.confirmPassword.length < 8 ||
    req.body.confirmPassword.length > 16
  )
    return next(new ErrorHandler("Mật khẩu phải từ 8 đến 16 kí tự", 400));
  if (req.body.password !== req.body.confirmPassword)
    return next(new ErrorHandler("Mật khẩu không khớp", 400));
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const updateUser = await database.query(
    `Update users set password= $1,reset_password_token=null, reset_password_expire=null where id= $2 returning *`,
    [hashedPassword, user.rows[0].id]
  );
  sendToken(updateUser.rows[0], 200, "Đổi mật khẩu thành công", res);
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { password, newPassword, confirmNewPassword } = req.body;
  if (!password || !newPassword || !confirmNewPassword)
    return next(new ErrorHandler("Vui lòng điền đầy đủ thông tin", 400));

  const isPasswordMatch = await bcrypt.compare(password, req.user.password);
  if (!isPasswordMatch) return next(new ErrorHandler("Sai mật khẩu", 400));
  if (newPassword === password)
    return next(new ErrorHandler("Mật khẩu mới trùng mật khẩu hiện tại"));
  if (newPassword !== confirmNewPassword)
    return next(new ErrorHandler("Mật khẩu mới không khớp", 400));
  if (
    newPassword.length < 8 ||
    newPassword.length > 16 ||
    confirmNewPassword.length < 8 ||
    confirmNewPassword.length > 16
  )
    return next(new ErrorHandler("Mật khẩu phải từ 8 đến 16 kí tự", 400));
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await database.query("UPdate users set password = $1 where id= $2", [
    hashedPassword,
    req.user.id,
  ]);
  res
    .status(200)
    .json({ success: true, message: "Cập nhật mật khẩu thành công" });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    address,
    province_id,
    province_name,
    district_id,
    district_name,
    ward_code,
    ward_name,
  } = req.body;
  if (
    !name ||
    !email ||
    !phone ||
    !address ||
    !province_id ||
    !province_name ||
    !district_id ||
    !district_name ||
    !ward_code ||
    !ward_name
  )
  return next(new ErrorHandler("Vui lòng điền đầy đủ thông tin", 400));
  if (!/^(\+84|0)\d{9}$/.test(phone)) {
    return next(new ErrorHandler("Số điện thoại không hợp lệ", 400));
  }
  if (name.trim().length === 0 || email.trim().length === 0)
    return next(new ErrorHandler("Tên và email không được để trống", 400));
  let avatarData = {};
  if (req.files && req.files.avatar) {
    const { avatar } = req.files;
    if (req.user?.avatar?.public_id)
      await cloudinary.uploader.destroy(req.user.avatar.public_id);

    const newProfileImage = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      {
        folder: "Ecommerce_Avatars",
        width: 150,
        crop: "scale",
      }
    );
    avatarData = {
      public_id: newProfileImage.public_id,
      url: newProfileImage.secure_url,
    };
  }
  let user;
  if (Object.keys(avatarData).length === 0) {
    user = await database.query(
      `Update users set name =$1, email = $2, phone=$3, address=$4, province_id = $5, province_name=$6,district_id = $7, district_name=$8, ward_code=$9, ward_name=$10 where id = $11 returning *`,
      [
        name,
        email,
        phone,
        address,
        province_id,
        province_name,
        district_id,
        district_name,
        ward_code,
        ward_name,
        req.user.id,
      ]
    );
  } else {
    user = await database.query(
      "Update users set name =$1, email = $2, avatar=$3 ,phone=$4, address=$5, province_id = $6, province_name=$7,district_id = $8, district_name=$9, ward_code=$10, ward_name=$11 where id = $12 returning *",
      [
        name,
        email,
        avatarData,
        phone,
        address,
        province_id,
        province_name,
        district_id,
        district_name,
        ward_code,
        ward_name,
        req.user.id,
      ]
    );
  }
  res.status(200).json({
    success: true,
    message: "Cập nhật hồ sơ thành công",
    user: user.rows[0],
  });
});

import jwt from "jsonwebtoken";

// export const sendToken = (user, statusCode, message, res) => {
//   const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });

//   res
//     .status(statusCode)
//     .cookie("token", token, {
//       expires: new Date(
//         Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//       ),
//       httpOnly: true,
//       sameSite: "none",
//       secure: true,
//     })
//     .json({
//       success: true,
//       user,
//       message,
//       token,
//     });
// };

// Thay đổi sameSite và secure cho môi trường Production (HTTPS)
export const sendToken = (user, statusCode, message, res) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  }); // Kiểm tra môi trường để đặt cấu hình bảo mật cookie

  const isProduction =
    process.env.NODE_ENV === "Production" ||
    process.env.NODE_ENV === "production";

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      // CẤU HÌNH QUAN TRỌNG CHO RENDER/PRODUCTION:
      sameSite: isProduction ? "None" : "lax", // Dùng 'None' nếu Frontend và Backend khác domain
      secure: isProduction ? true : false, // Bắt buộc phải là 'true' khi chạy qua HTTPS (Render)
    })
    .json({
      success: true,
      user,
      message,
      token,
    });
};

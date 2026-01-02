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
// Thay đổi tạm thời trong utils/jwtToken.js để kiểm tra
export const sendToken = (user, statusCode, message, res) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      sameSite: "None",
      secure: true,
    })
    .json({
      success: true,
      user,
      message,
      token,
    });
};

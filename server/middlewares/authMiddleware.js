import jwt from "jsonwebtoken";
import database from "../database/db.js";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./errorMiddleware.js";
import dotenv from "dotenv";
dotenv.config();

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token)
    return next(new ErrorHandler("Vui lòng đăng nhập để tiếp tục", 401));
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const userResult = await database.query(
    "SELECT * FROM users WHERE id = $1 LIMIT 1",
    [decoded.id]
  );

  if (userResult.rows.length === 0) {
    return next(new ErrorHandler("Người dùng không tồn tại", 401));
  }

  const user = userResult.rows[0];

  if (user.status === "blocked" && user.role !== "Admin")
    return next(new ErrorHandler("Tài khoản của bạn đã bị khóa", 403));

  req.user = user;
  next();
});

export const authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`Role: ${req.user.role} không được phép truy cập`, 403)
      );
    }
    next();
  };
};

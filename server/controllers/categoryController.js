import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import database from "../database/db.js";

export const getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const result = await database.query(
    `SELECT * FROM categories ORDER BY created_at DESC`
  );

  res.status(200).json({
    success: true,
    message: "Lấy danh sách danh mục thành công",
    categories: result.rows,
  });
});

export const createCategory = catchAsyncErrors(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new ErrorHandler("Tên danh mục không được để trống", 400));
  }

  const existingCategory = await database.query(
    `SELECT * FROM categories WHERE LOWER(name) = LOWER($1)`,
    [name.trim()]
  );

  if (existingCategory.rows.length > 0) {
    return next(new ErrorHandler("Tên danh mục đã tồn tại", 400));
  }

  const category = await database.query(
    `INSERT INTO categories (name) VALUES ($1) RETURNING *`,
    [name.trim()]
  );

  res.status(201).json({
    success: true,
    message: "Tạo danh mục thành công",
    category: category.rows[0],
  });
});

export const updateCategory = catchAsyncErrors(async (req, res, next) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  if (!name) {
    return next(new ErrorHandler("Không được để trống dữ liệu", 400));
  }

  const category = await database.query(
    `SELECT * FROM categories WHERE id = $1`,
    [categoryId]
  );

  if (category.rows.length === 0) {
    return next(new ErrorHandler("Không tìm thấy danh mục", 404));
  }

  const cateCheckName = await database.query(
    `SELECT * FROM categories WHERE LOWER(name) = LOWER($1) and id != $2`,
    [name.trim(), categoryId]
  );

  if (cateCheckName.rows.length > 0) {
    return next(new ErrorHandler("Tên danh mục trùng", 400));
  }

  const updatedCategory = await database.query(
    `UPDATE categories SET name = $1, created_at = NOW() WHERE id = $2 RETURNING *`,
    [name.trim(), categoryId]
  );

  res.status(200).json({
    success: true,
    message: "Cập nhật danh mục thành công",
    category: updatedCategory.rows[0],
  });
});

export const deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await database.query(
    `SELECT * FROM categories WHERE id = $1`,
    [categoryId]
  );

  if (category.rows.length === 0) {
    return next(new ErrorHandler("Không tìm thấy danh mục", 404));
  }

  // Check if category has any products
  const productsCheck = await database.query(
    `SELECT COUNT(*) FROM products WHERE category_id = $1`,
    [categoryId]
  );

  if (parseInt(productsCheck.rows[0].count) > 0) {
    return next(
      new ErrorHandler(
        "Không thể xóa danh mục vì có sản phẩm đang sử dụng",
        400
      )
    );
  }

  const deletedCategory = await database.query(
    `DELETE FROM categories WHERE id = $1 RETURNING *`,
    [categoryId]
  );

  res.status(200).json({
    success: true,
    message: "Xóa danh mục thành công",
    category: deletedCategory.rows[0],
  });
});

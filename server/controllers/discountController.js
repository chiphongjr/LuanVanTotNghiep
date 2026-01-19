import database from "../database/db.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

export const createDiscount = catchAsyncErrors(async (req, res, next) => {
  const { code, value, start_date, end_date } = req.body;

  if (!code || !value || !start_date || !end_date)
    return next(new ErrorHandler("Không được để trống dữ liệu", 400));

  if (end_date < start_date) {
    return next(
      new ErrorHandler("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu", 400)
    );
  }
  const today = new Date().toISOString().split("T")[0];

  if (start_date < today) {
    return next(
      new ErrorHandler("Mã giảm giá phải từ ngày hôm nay trở đi", 400)
    );
  }

  if (value < 1000)
    return next(new ErrorHandler("Mã giảm giá tối thiểu từ 1000 đ", 400));

  const isExistingCode = await database.query(
    `Select id from discounts where upper(code) = upper($1)`,
    [code]
  );

  if (isExistingCode.rows.length > 0)
    return next(new ErrorHandler("Mã giảm giá đã tồn tại", 400));

  const result = await database.query(
    `Insert into discounts (code,value,start_date,end_date) values (upper($1),$2,$3::date,$4::date) returning *`,
    [code, value, start_date, end_date]
  );

  res.status(200).json({
    success: true,
    message: "Thêm mã giảm giá thành công",
    discount: result.rows[0],
  });
});

export const fetchAllDiscount = catchAsyncErrors(async (req, res, next) => {
  const result = await database.query(
    `Select * from discounts order by created_at desc`
  );

  res.status(200).json({
    success: true,
    message: "Lấy tất cả mã giảm giá thành công",
    discounts: result.rows,
  });
});

// export const deleteDiscount = catchAsyncErrors(async (req, res, next) => {
//   const { orderId } = req.params;

//   const checkOrder = await database.query(
//     `Select * from orders where id = $1`,
//     [orderId]
//   );

//   if (checkOrder.rows.length === 0)
//     return next(new ErrorHandler("Không tìm thấy đơn hàng", 400));
// });

export const validateDiscount = catchAsyncErrors(async (req, res, next) => {
  const { code, order_total } = req.body;

  if (!code) return next(new ErrorHandler("Vui lòng nhập mã giảm giá", 400));

  const result = await database.query(
    `Select id,code,value from discounts where code = $1 AND start_date <= CURRENT_DATE
      AND end_date >= CURRENT_DATE`,
    [code.toUpperCase()]
  );

  if (result.rows.length === 0)
    return next(
      new ErrorHandler("Mã giảm giá không tồn tại hoặc hết hạn", 404)
    );

  let final_price;

  if (order_total <= result.rows[0].value) {
    final_price = 0;
  } else {
    final_price = order_total - result.rows[0].value;
  }

  res.status(200).json({ success: true, discount: result.rows[0] });
});

export const updateDiscount = catchAsyncErrors(async (req, res, next) => {
  const { discountId } = req.params;
  const { code, value, start_date, end_date } = req.body;

  if (!code || !value || !start_date || !end_date)
    return next(new ErrorHandler("Không được để trống dữ liệu", 400));

  const today = new Date().toISOString().split("T")[0];

  if (start_date < today)
    return next(
      new ErrorHandler("Mã giảm giá phải từ ngày hôm nay trở đi", 400)
    );
  if (start_date > end_date)
    return next(
      new ErrorHandler("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu", 400)
    );
  const isExistingCode = await database.query(
    `Select id from discounts where upper(code) = upper($1) and id <> $2`,
    [code.trim(), discountId]
  );

  if (isExistingCode.rows.length > 0)
    return next(new ErrorHandler("Mã giảm giá đã tồn tại", 400));

  const result = await database.query(
    `Update discounts set code=upper($1), value=$2, start_date=$3::date,end_date=$4::date where id = $5 returning *`,
    [code.trim(), value, start_date, end_date, discountId]
  );

  res.status(200).json({
    success: true,
    message: "Cập nhật mã thành công",
    updatedDiscount: result.rows[0],
  });
});

import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import database from "../database/db.js";
import {
  cancelPaymentIntent,
  generatePaymentIntent,
} from "../utils/generatePaymentIntent.js";

export const placeNewOrder = catchAsyncErrors(async (req, res, next) => {
  const { full_name, city, address, phone, orderedItems, discount_code } =
    req.body;

  if (!full_name || !city || !address || !phone) {
    return next(
      new ErrorHandler("Vui lòng cung cấp đầy đủ thông tin giao hàng", 400)
    );
  }

  if (!/^(\+84|0)\d{9}$/.test(phone)) {
    return next(new ErrorHandler("Số điện thoại không hợp lệ", 400));
  }

  const cart_items = Array.isArray(orderedItems)
    ? orderedItems
    : JSON.parse(orderedItems);

  if (!cart_items || cart_items.length === 0) {
    return next(new ErrorHandler("Không có sản phẩm trong giỏ hàng", 400));
  }

  // ===== LẤY SẢN PHẨM =====
  const productIds = cart_items.map((i) => i.product_id);
  const { rows: products } = await database.query(
    `SELECT id, price, stock, name FROM products WHERE id = ANY($1::uuid[])`,
    [productIds]
  );

  let order_total_price = 0;
  let discount_id = null;
  let discount_value = 0;

  // ===== ÁP MÃ GIẢM GIÁ (1 LẦN) =====
  if (discount_code) {
    const discountResult = await database.query(
      `SELECT id, value 
       FROM discounts 
       WHERE code = $1
       AND start_date <= CURRENT_DATE
       AND end_date >= CURRENT_DATE`,
      [discount_code]
    );

    if (discountResult.rows.length === 0) {
      return next(new ErrorHandler("Mã giảm giá không hợp lệ", 400));
    }

    discount_id = discountResult.rows[0].id;
    discount_value = discountResult.rows[0].value;
  }

  const order_item_values = [];
  const order_item_placeholders = [];

  // ===== DUYỆT CART =====
  for (const [index, cart_item] of cart_items.entries()) {
    const product = products.find((p) => p.id === cart_item.product_id);

    if (!product) {
      return next(
        new ErrorHandler(`Không tìm thấy sản phẩm ${cart_item.product_id}`, 404)
      );
    }

    if (cart_item.cart_item_quantity > product.stock) {
      return next(
        new ErrorHandler(
          `Chỉ còn ${product.stock} sản phẩm cho ${product.name}`,
          400
        )
      );
    }

    order_total_price += product.price * cart_item.cart_item_quantity;

    const offset = index * 6;
    order_item_placeholders.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${
        offset + 5
      }, $${offset + 6})`
    );

    order_item_values.push(
      null, // order_id
      product.id,
      cart_item.cart_item_quantity,
      product.price,
      cart_item.product_image || "",
      product.name
    );
  }

  // ===== FINAL PRICE =====
  const final_price = Math.max(order_total_price - discount_value, 0);

  if (final_price < 20000) {
    return next(new ErrorHandler("Đơn hàng tối thiểu 20.000đ", 400));
  }

  // ===== TẠO ORDER =====
  const orderResult = await database.query(
    `INSERT INTO orders (buyer_id, total_price, discount_id, final_price)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [req.user.id, order_total_price, discount_id, final_price]
  );

  const order_id = orderResult.rows[0].id;

  for (let i = 0; i < order_item_values.length; i += 6) {
    order_item_values[i] = order_id;
  }

  // ===== ORDER ITEMS =====
  await database.query(
    `INSERT INTO order_items (order_id, product_id, quantity, price, image, title)
     VALUES ${order_item_placeholders.join(", ")}`,
    order_item_values
  );

  // ===== SHIPPING =====
  await database.query(
    `INSERT INTO shipping_info (order_id, full_name, city, address, phone)
     VALUES ($1, $2, $3, $4, $5)`,
    [order_id, full_name, city, address, phone]
  );

  // ===== PAYMENT =====
  const paymentResponse = await generatePaymentIntent(order_id, final_price);

  if (!paymentResponse.success) {
    return next(new ErrorHandler("Thanh toán thất bại", 500));
  }

  res.status(200).json({
    success: true,
    message: "Đặt hàng thành công",
    orderId: order_id,
    final_price,
    paymentIntent: paymentResponse.clientSecret,
  });
});

export const fetchSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const result = await database.query(
    `
  SELECT o.*, 
    COALESCE(
          json_agg(
          json_build_object(
          'order_item_id', oi.id,
          'order_id', oi.order_id,
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price
          )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]') AS order_items,
          
          json_build_object(
          'full_name', s.full_name,
          'city', s.city,
          'address', s.address,
          'phone', s.phone
          ) AS shipping_info
          FROM orders o
          LEFT JOIN order_items oi ON o.id = oi.order_id
          LEFT JOIN shipping_info s ON o.id = s.order_id
          WHERE o.id = $1
          GROUP BY o.id, s.id;
          `,
    [orderId]
  );

  res.status(200).json({
    success: true,
    message: "Order fetched.",
    orders: result.rows[0],
  });
});

export const fetchMyOrders = catchAsyncErrors(async (req, res, next) => {
  const result = await database.query(
    `
        SELECT o.*, COALESCE(
 json_agg(
  json_build_object(
 'order_item_id', oi.id,
 'order_id', oi.order_id,
 'product_id', oi.product_id,
 'quantity', oi.quantity,
 'price', oi.price,
 'image', oi.image,
 'title', oi.title
  ) 
 ) FILTER (WHERE oi.id IS NOT NULL), '[]'
 ) AS order_items,
json_build_object(
 'full_name', s.full_name,
 'city', s.city,
 'address', s.address,
 'phone', s.phone
 ) AS shipping_info 
 FROM orders o
 LEFT JOIN order_items oi ON o.id = oi.order_id
 LEFT JOIN shipping_info s ON o.id = s.order_id
WHERE o.buyer_id = $1 AND o.paid_at IS NOT NULL
GROUP BY o.id, s.id
        `,
    [req.user.id]
  );

  res.status(200).json({
    success: true,
    message: "All your orders are fetched.",
    myOrders: result.rows,
  });
});

export const fetchAllOrders = catchAsyncErrors(async (req, res, next) => {
  const result = await database.query(`
            SELECT o.*,
 COALESCE(json_agg(
 json_build_object(
 'order_item_id', oi.id,
 'order_id', oi.order_id,
 'product_id', oi.product_id,
 'quantity', oi.quantity,
 'price', oi.price,
 'image', oi.image,
 'title', oi.title
)
) FILTER (WHERE oi.id IS NOT NULL), '[]' ) AS order_items, json_build_object(
'full_name', s.full_name,
 'city', s.city,
 'address', s.address,
 'phone', s.phone 
) AS shipping_info
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN shipping_info s ON o.id = s.order_id
WHERE o.paid_at IS NOT NULL
GROUP BY o.id, s.id
        `);

  res.status(200).json({
    success: true,
    message: "All orders fetched.",
    orders: result.rows,
  });
});

export const updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  if (!status) {
    return next(
      new ErrorHandler("Cung cấp tình trạng hợp lệ cho đơn hàng", 400)
    );
  }
  const { orderId } = req.params;
  const results = await database.query(
    `
    SELECT * FROM orders WHERE id = $1
    `,
    [orderId]
  );

  if (results.rows.length === 0) {
    return next(new ErrorHandler("Mã đơn hàng không hợp lệ", 404));
  }

  if (results.rows[0].order_status === "Cancelled") {
    return next(new ErrorHandler("Đơn hàng đã bị hủy không thể thao tác", 400));
  }

  if (status === "Cancelled" && results.rows[0].order_status !== "Cancelled") {
    const orderItems = await database.query(
      `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    for (const item of orderItems.rows) {
      await database.query(
        `UPDATE products SET stock = stock + $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }
  }

  const updatedOrder = await database.query(
    `
    UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *
    `,
    [status, orderId]
  );

  res.status(200).json({
    success: true,
    message: "Order status updated.",
    updatedOrder: updatedOrder.rows[0],
  });
});

export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const results = await database.query(
    `
        DELETE FROM orders WHERE id = $1 RETURNING *
        `,
    [orderId]
  );
  if (results.rows.length === 0) {
    return next(new ErrorHandler("Mã đơn hàng không hợp lệ", 404));
  }

  res.status(200).json({
    success: true,
    message: "Xóa đơn hàng thành công",
    order: results.rows[0],
  });
});

export const cancelOrderPayment = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.body; // lấy orderId từ body POST

  // 1️⃣ Kiểm tra đơn hàng tồn tại
  const orderResult = await database.query("SELECT * FROM orders WHERE id=$1", [
    orderId,
  ]);
  if (orderResult.rows.length === 0)
    return next(new ErrorHandler("Đơn hàng không tồn tại", 404));

  const order = orderResult.rows[0];

  // 2️⃣ Kiểm tra đơn đã hủy chưa
  if (order.order_status === "Cancelled")
    return next(new ErrorHandler("Đơn hàng đã bị hủy không thể thao tác", 400));

  // 3️⃣ Hủy payment trên Stripe
  const paymentResponse = await cancelPaymentIntent(orderId);
  if (!paymentResponse.success)
    return next(new ErrorHandler("Hủy thanh toán thất bại", 500));

  // 4️⃣ Cập nhật trạng thái đơn hàng = Cancelled
  await database.query(
    "UPDATE orders SET order_status='Cancelled' WHERE id=$1",
    [orderId]
  );

  // 5️⃣ (Tuỳ chọn) trả stock về nếu cần
  const orderItems = await database.query(
    "SELECT product_id, quantity FROM order_items WHERE order_id=$1",
    [orderId]
  );
  for (const item of orderItems.rows) {
    await database.query("UPDATE products SET stock = stock + $1 WHERE id=$2", [
      item.quantity,
      item.product_id,
    ]);
  }

  res.status(200).json({
    success: true,
    message: "Hủy thanh toán thành công",
    paymentResponse,
  });
});

export const cancelOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;

  const result = await database.query(`select * from orders where id = $1`, [
    orderId,
  ]);

  if (result.rows.length === 0)
    return next(new ErrorHandler("Không tìm thấy đơn hàng", 404));

  const order = result.rows[0];

  if (order.order_status !== "Processing")
    return next(
      new ErrorHandler("Chỉ được hủy đơn hàng trạng thái đang xử lý", 400)
    );

  const items = await database.query(
    `Select product_id,quantity from order_items where order_id = $1`,
    [orderId]
  );

  for (const item of items.rows) {
    await database.query(
      `update products set stock = stock + $1 where id = $2`,
      [item.quantity, item.product_id]
    );
  }

  await database.query(
    `update orders set order_status = 'Cancelled' where id = $1`,
    [orderId]
  );

  res.status(200).json({
    success: true,
    message: "Hủy đặt hàng thành công",
  });
});

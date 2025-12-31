import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import database from "../database/db.js";

export const getCart = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  let cartResult = await database.query(
    `SELECT * FROM carts WHERE user_id = $1`,
    [userId]
  );

  if (cartResult.rows.length === 0) {
    cartResult = await database.query(
      `INSERT INTO carts (user_id) VALUES ($1) RETURNING *`,
      [userId]
    );
  }

  const cart = cartResult.rows[0];

  // Lấy tất cả item
  const itemsResult = await database.query(
    `
    SELECT 
      ci.id AS cart_item_id,
      ci.quantity AS cart_item_quantity,
      p.id AS product_id,
      p.name AS product_name,
      p.price AS product_price,
      p.stock AS product_stock,
      p.images->0->>'url' as product_image
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = $1
    `,
    [cart.id]
  );

  const items = itemsResult.rows;
  const cart_total_quantity = items.reduce(
    (sum, i) => sum + i.cart_item_quantity,
    0
  );

  res.status(200).json({
    success: true,
    cart: {
      cart_id: cart.id,
      cart_items: items,
      cart_total_quantity,
    },
  });
});

export const addToCart = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  const { product_id, quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new ErrorHandler("Số lượng phải lớn hơn 0", 400));
  }

  const productCheck = await database.query(
    `SELECT * FROM products WHERE id = $1`,
    [product_id]
  );

  if (productCheck.rows.length === 0) {
    return next(new ErrorHandler("Sản phẩm không tồn tại", 404));
  }

  const product = productCheck.rows[0];

  if (product.stock <= 0) {
    return next(new ErrorHandler("Sản phẩm hiện tại đã hết hàng", 400));
  }

  if (quantity > product.stock) {
    return next(
      new ErrorHandler(`Chỉ còn lại số lượng ${product.stock} sản phẩm`, 400)
    );
  }

  // Lấy hoặc tạo cart
  let cartResult = await database.query(
    `SELECT * FROM carts WHERE user_id = $1`,
    [userId]
  );

  if (cartResult.rows.length === 0) {
    cartResult = await database.query(
      `INSERT INTO carts (user_id) VALUES ($1) RETURNING *`,
      [userId]
    );
  }

  const cart = cartResult.rows[0];

  // Kiểm tra item đã tồn tại chưa
  const checkItem = await database.query(
    `SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
    [cart.id, product_id]
  );

  const currentQuantity =
    checkItem.rows.length > 0 ? checkItem.rows[0].quantity : 0;

  const newTotalQuantity = currentQuantity + quantity;

  // ⭐ RÀO QUAN TRỌNG – tổng vượt stock thì cấm
  if (newTotalQuantity > product.stock) {
    return next(
      new ErrorHandler(
        `Sản phẩm chỉ còn ${product.stock} cái. Bạn đang có ${currentQuantity} cái trong giỏ.`,
        400
      )
    );
  }

  if (checkItem.rows.length > 0) {
    await database.query(
      `UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2`,
      [quantity, checkItem.rows[0].id]
    );
  } else {
    await database.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)`,
      [cart.id, product_id, quantity]
    );
  }

  // Lấy lại cart
  const itemsResult = await database.query(
    `
    SELECT 
      ci.id AS cart_item_id,
      ci.quantity AS cart_item_quantity,
      p.id AS product_id,
      p.name AS product_name,
      p.price AS product_price,
      p.stock AS product_stock,
      p.images->0->>'url' as product_image
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = $1
    `,
    [cart.id]
  );

  const items = itemsResult.rows;
  const cart_total_quantity = items.reduce(
    (sum, i) => sum + i.cart_item_quantity,
    0
  );

  res.status(200).json({
    success: true,
    message: "Đã thêm vào giỏ hàng",
    cart: {
      cart_id: cart.id,
      cart_items: items,
      cart_total_quantity,
    },
  });
});

export const updateCart = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { cart_item_id, quantity } = req.body;

  if (quantity < 1)
    return next(new ErrorHandler("Số lượng phải lớn hơn 0", 400));

  const itemCheck = await database.query(
    `
    SELECT ci.*, p.stock, c.user_id
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    JOIN products p ON ci.product_id = p.id
    WHERE ci.id = $1 AND c.user_id = $2
    `,
    [cart_item_id, userId]
  );
  if (itemCheck.rows.length === 0)
    return next(new ErrorHandler("Không tìm thấy item trong giỏ hàng", 404));

  if (quantity > itemCheck.rows[0].stock) {
    return next(
      new ErrorHandler(
        `Số lượng tối đa còn lại của sản phẩm là ${itemCheck.rows[0].stock}`,
        400
      )
    );
  }
  await database.query(`UPDATE cart_items SET quantity = $1 WHERE id = $2`, [
    quantity,
    cart_item_id,
  ]);

  // Lấy lại cart
  const cartResult = await database.query(
    `SELECT * FROM carts WHERE user_id = $1`,
    [userId]
  );
  const cart = cartResult.rows[0];

  const itemsResult = await database.query(
    `
    SELECT 
      ci.id AS cart_item_id,
      ci.quantity AS cart_item_quantity,
      p.id AS product_id,
      p.name AS product_name,
      p.stock AS product_stock,
      p.price AS product_price,
      p.images->0->>'url' as product_image
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = $1
    `,
    [cart.id]
  );

  const items = itemsResult.rows;
  const cart_total_quantity = items.reduce(
    (sum, i) => sum + i.cart_item_quantity,
    0
  );

  res.status(200).json({
    success: true,
    message: "Cập nhật giỏ hàng thành công",
    cart: {
      cart_id: cart.id,
      cart_items: items,
      cart_total_quantity,
    },
  });
});

export const removeCart = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { cart_item_id } = req.params;

  const itemCheck = await database.query(
    `
    SELECT ci.*, c.user_id
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    WHERE ci.id = $1 AND c.user_id = $2
    `,
    [cart_item_id, userId]
  );

  if (itemCheck.rows.length === 0)
    return next(new ErrorHandler("Không tìm thấy item trong giỏ hàng", 404));

  await database.query(`DELETE FROM cart_items WHERE id = $1`, [cart_item_id]);

  const cartResult = await database.query(
    `SELECT * FROM carts WHERE user_id = $1`,
    [userId]
  );
  const cart = cartResult.rows[0];

  const itemsResult = await database.query(
    `
    SELECT 
      ci.id AS cart_item_id,
      ci.quantity AS cart_item_quantity,
      p.id AS product_id,
      p.name AS product_name,
      p.price AS product_price,
      p.stock AS product_stock,
      p.images->0->>'url' as product_image
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = $1
    `,
    [cart.id]
  );

  const items = itemsResult.rows;
  const cart_total_quantity = items.reduce(
    (sum, i) => sum + i.cart_item_quantity,
    0
  );

  res.status(200).json({
    success: true,
    message: "Xóa item khỏi giỏ hàng thành công",
    cart: {
      cart_id: cart.id,
      cart_items: items,
      cart_total_quantity,
    },
  });
});

export const clearCart = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  const cartResult = await database.query(
    `SELECT * FROM carts WHERE user_id = $1`,
    [userId]
  );

  if (cartResult.rows.length === 0) {
    return res.status(200).json({
      success: true,
      cart: {
        cart_id: null,
        cart_items: [],
        cart_total_quantity: 0,
      },
    });
  }

  const cart = cartResult.rows[0];

  // Xóa toàn bộ item trong cart_items
  await database.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cart.id]);

  return res.status(200).json({
    success: true,
    message: "Đã xoá toàn bộ giỏ hàng",
    cart: {
      cart_id: cart.id,
      cart_items: [],
      cart_total_quantity: 0,
    },
  });
});

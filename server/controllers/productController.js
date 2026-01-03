import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { v2 as cloudinary } from "cloudinary";
import database from "../database/db.js";
import { getAIRecommendation } from "../utils/getAIRecommendation.js";

export const createProduct = catchAsyncErrors(async (req, res, next) => {
  const { name, description, price, category_id, stock } = req.body;
  const created_by = req.user.id;

  if (!name || !price || !category_id || !stock) {
    return next(new ErrorHandler("Không được để trống dữ liệu", 400));
  }

  if (price < 20000) {
    return next(new ErrorHandler("Giá sản phẩm tối thiểu từ 20000 đ", 400));
  }

  if (price > 999999999) {
    return next(new ErrorHandler("Giá tối đa là 999.999.999 đ", 400));
  }

  if (stock <= 0) {
    return next(new ErrorHandler("Số lượng tồn kho phải lớn hơn 0", 400));
  }

  if (!req.files || !req.files.images) {
    return next(new ErrorHandler("Vui lòng tải lên ít nhất 1 ảnh", 400));
  }

  let uploadedImages = [];
  if (req.files && req.files.images) {
    const images = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];

    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "Ecommerce_Product_Images",
        width: 1000,
        crop: "scale",
      });

      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
  }

  const checkProduct = await database.query(
    `Select id from products where Lower(name) = lower($1)`,
    [name.trim()]
  );

  if (checkProduct.rows.length > 0)
    return next(new ErrorHandler("Tên sản phẩm đã tồn tại", 400));

  const searchText = `${name} ${description}`;

  const product = await database.query(
    `INSERT INTO products (name, description, price, category_id, stock, images, created_by, search_vector) VALUES ($1, $2, $3, $4, $5, $6, $7,to_tsvector('simple',$8)) RETURNING *`,
    [
      name,
      description,
      price,
      category_id,
      stock,
      JSON.stringify(uploadedImages),
      created_by,
      searchText,
    ]
  );

  res.status(201).json({
    success: true,
    message: "Tạo sản phẩm thành công",
    product: product.rows[0],
  });
});

export const fetchAllProducts = async (req, res) => {
  try {
    // ===== 1. LẤY QUERY PARAM =====
    let { price, category, ratings, search, page } = req.query;

    page = Number(page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;

    // ===== 2. XỬ LÝ GIÁ =====
    let minPrice = null;
    let maxPrice = null;

    if (price) {
      const parts = price.split("-");
      minPrice = Number(parts[0]);
      maxPrice = Number(parts[1]);
    }

    // ===== 3. CHUẨN HÓA FILTER =====
    category = category ? `'${category}'` : null;
    ratings = ratings ? Number(ratings) : null;
    search = search ? `'${search}'` : null;

    // ===== 4. ĐẾM TỔNG SẢN PHẨM =====
    const countQuery = `
    SELECT COUNT(*)
    FROM products p
    WHERE
      (${minPrice} IS NULL OR p.price BETWEEN ${minPrice} AND ${maxPrice})
      AND (${category} IS NULL OR p.category_id = ${category})
      AND (${ratings} IS NULL OR CEIL(p.ratings) = ${ratings})
      AND (${search} IS NULL OR unaccent(p.name) ILIKE '%' || unaccent(${search}) || '%')`;

    const countResult = await database.query(countQuery);
    const totalProducts = Number(countResult.rows[0].count);

    // ===== 5. LẤY DANH SÁCH SẢN PHẨM =====
    const productsQuery = `
      SELECT 
        p.*,
        c.id AS category_id,
        c.name AS category_name,
        COUNT(r.id) AS review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE
        (${minPrice} IS NULL OR p.price BETWEEN ${minPrice} AND ${maxPrice})
        AND (${category} IS NULL OR p.category_id = ${category})
        AND (${ratings} IS NULL OR CEIL(p.ratings) = ${ratings})
        AND (${search} IS NULL OR p.search_vector @@ plainto_tsquery('simple', ${search}))     
        GROUP BY p.id, c.id, c.name
        ORDER BY p.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
    `;

    const productsResult = await database.query(productsQuery);

    const newProductsQuery = `
      SELECT 
        p.*,
        c.id AS category_id,
        c.name AS category_name,
        COUNT(r.id) AS review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.created_at >= NOW() - INTERVAL '3 days' and p.stock > 0
      GROUP BY p.id, c.id, c.name
      ORDER BY p.created_at DESC
      LIMIT 8
    `;

    const newProductsResult = await database.query(newProductsQuery);

    const topRatedQuery = `
      SELECT 
        p.*,
        c.id AS category_id,
        c.name AS category_name,
        COUNT(r.id) AS review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.ratings >= 4 and p.stock > 0
      GROUP BY p.id, c.id, c.name
      ORDER BY p.ratings DESC, p.created_at DESC
      LIMIT 8
    `;

    const topRatedResult = await database.query(topRatedQuery);

    res.status(200).json({
      success: true,
      products: productsResult.rows,
      totalProducts,
      newProducts: newProductsResult.rows,
      topRatedProducts: topRatedResult.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProduct = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const { name, description, price, category_id, stock } = req.body;

  if (!name || !price || !category_id || !stock) {
    return next(new ErrorHandler("Không được để trống dữ liệu", 400));
  }

  if (price < 20000) {
    return next(new ErrorHandler("Giá sản phẩm tối thiểu từ 20000 đ", 400));
  }

  if (price > 999999999) {
    return next(new ErrorHandler("Giá tối đa là 999.999.999 đ", 400));
  }

  if (stock < 0)
    return next(new ErrorHandler("Tồn kho tối thiểu phải bằng 0", 400));

  const product = await database.query("SELECT * FROM products WHERE id = $1", [
    productId,
  ]);

  if (product.rows.length === 0) {
    return next(new ErrorHandler("Không tìm thấy sản phẩm", 400));
  }

  const checkProduct = await database.query(
    `Select id from products where Lower(name) = lower($1) and id != $2`,
    [name.trim(), productId]
  );

  if (checkProduct.rows.length > 0)
    return next(new ErrorHandler("Tên sản phẩm đã tồn tại", 400));

  let uploadedImages = product.rows[0].images;

  if (req.files && req.files.images) {
    // xoa anh cu tren cloud
    if (uploadedImages && uploadedImages.length > 0) {
      for (const image of uploadedImages) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    uploadedImages = []; //reset anh cu

    //tai anh moi len sau khi xoa
    const images = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];

    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "Ecommerce_Product_Images",
        width: 1000,
        crop: "scale",
      });

      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
  }

  const searchText = `${name} ${description}`;

  const updated = await database.query(
    `UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, stock = $5, images = $6, search_vector = to_tsvector('simple',$7) WHERE id = $8 RETURNING *`,
    [
      name,
      description,
      price,
      category_id,
      stock,
      JSON.stringify(uploadedImages),
      searchText,
      productId,
    ]
  );
  res.status(200).json({
    success: true,
    message: "Cập nhật sản phẩm thành công",
    updatedProduct: updated.rows[0],
  });
});

export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const product = await database.query("SELECT * FROM products WHERE id = $1", [
    productId,
  ]);
  if (product.rows.length === 0) {
    return next(new ErrorHandler("Không tìm thấy sản phẩm", 404));
  }

  const checkOrderItem = await database.query(
    `Select id from order_items where product_id = $1`,
    [productId]
  );

  if (checkOrderItem.rows.length > 0) {
    return next(
      new ErrorHandler("Sản phẩm có trong đơn hàng không thể xóa", 404)
    );
  }

  const images = product.rows[0].images;

  const deleteResult = await database.query(
    "DELETE FROM products WHERE id = $1 RETURNING *",
    [productId]
  );

  if (deleteResult.rows.length === 0) {
    return next(new ErrorHandler("Xóa sản phẩm thất bại", 500));
  }

  // Delete images from Cloudinary
  if (images && images.length > 0) {
    for (const image of images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  }

  res.status(200).json({
    success: true,
    message: "Xóa sản phẩm thành công",
  });
});

export const fetchSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const result = await database.query(
    `
        SELECT p.*,
        c.id as category_id,
        c.name as category_name,
        COALESCE(
        json_agg(
        json_build_object(
            'review_id', r.id,
            'rating', r.rating,
            'comment', r.comment,
            'reviewer', json_build_object(
            'id', u.id,
            'name', u.name,
            'avatar', u.avatar
            )) 
        ) FILTER (WHERE r.id IS NOT NULL), '[]') AS reviews
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN reviews r ON p.id = r.product_id
         LEFT JOIN users u ON r.user_id = u.id
         WHERE p.id  = $1
         GROUP BY p.id, c.id, c.name`,
    [productId]
  );

  res.status(200).json({
    success: true,
    message: "Load sản phẩm thành công",
    product: result.rows[0],
  });
});

//1 user review 1 lan
// export const postProductReview = catchAsyncErrors(async (req, res, next) => {
//   const { productId } = req.params;
//   const { rating, comment } = req.body;

//   if (!rating || !comment) {
//     return next(new ErrorHandler("Vui lòng chấm sao và để lại bình luận", 400));
//   }

//   if (rating < 1 || rating > 5) {
//     return next(new ErrorHandler("Số sao phải từ 1 đến 5", 400));
//   }

//   const purchasheCheckQuery = `
//     SELECT oi.product_id
//     FROM order_items oi
//     JOIN orders o ON o.id = oi.order_id
//     JOIN payments p ON p.order_id = o.id
//     WHERE o.buyer_id = $1
//     AND oi.product_id = $2
//     and o.order_status = 'Delivered'
//     AND p.payment_status = 'Paid'
//     LIMIT 1
//   `;

//   const { rows } = await database.query(purchasheCheckQuery, [
//     req.user.id,
//     productId,
//   ]);

//   if (rows.length === 0) {
//     return res.status(403).json({
//       success: false,
//       message: "Bạn chỉ được đánh giá sản phẩm đã mua",
//     });
//   }

//   const product = await database.query("SELECT * FROM products WHERE id = $1", [
//     productId,
//   ]);
//   if (product.rows.length === 0) {
//     return next(new ErrorHandler("Không tìm thấy sản phẩm", 404));
//   }

//   const isAlreadyReviewed = await database.query(
//     `
//     SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2
//     `,
//     [productId, req.user.id]
//   );

//   let review;

//   if (isAlreadyReviewed.rows.length > 0) {
//     review = await database.query(
//       "UPDATE reviews SET rating = $1, comment = $2 WHERE product_id = $3 AND user_id = $4 RETURNING *",
//       [rating, comment, productId, req.user.id]
//     );
//   } else {
//     review = await database.query(
//       "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
//       [productId, req.user.id, rating, comment]
//     );
//   }

//   const allReviews = await database.query(
//     `SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id = $1`,
//     [productId]
//   );

//   const newAvgRating = allReviews.rows[0].avg_rating;

//   const updatedProduct = await database.query(
//     `
//         UPDATE products SET ratings = $1 WHERE id = $2 RETURNING *
//         `,
//     [newAvgRating, productId]
//   );

//   res.status(200).json({
//     success: true,
//     message: "Đánh giá đã được đăng",
//     review: review.rows[0],
//     product: updatedProduct.rows[0],
//   });
// });

export const postProductReview = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return next(new ErrorHandler("Vui lòng chấm sao và để lại bình luận", 400));
  }

  if (rating < 1 || rating > 5) {
    return next(new ErrorHandler("Số sao phải từ 1 đến 5", 400));
  }

  // check đã mua (GIỮ NGUYÊN – rất tốt)
  const purchasheCheckQuery = `
    SELECT 1
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN payments p ON p.order_id = o.id
    WHERE o.buyer_id = $1
      AND oi.product_id = $2
      AND o.order_status = 'Delivered'
      AND p.payment_status = 'Paid'
    LIMIT 1
  `;

  const { rows } = await database.query(purchasheCheckQuery, [
    req.user.id,
    productId,
  ]);

  if (rows.length === 0) {
    return next(new ErrorHandler("Bạn chỉ được đánh giá sản phẩm đã mua", 403));
  }

  // ✅ LUÔN INSERT
  const review = await database.query(
    `
    INSERT INTO reviews (product_id, user_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [productId, req.user.id, rating, comment]
  );

  // cập nhật rating trung bình
  const avg = await database.query(
    `SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id = $1`,
    [productId]
  );

  await database.query(`UPDATE products SET ratings = $1 WHERE id = $2`, [
    avg.rows[0].avg_rating,
    productId,
  ]);

  res.status(201).json({
    success: true,
    message: "Đánh giá đã được đăng",
    review: review.rows[0],
  });
});

export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  const { reviewId } = req.params;

  const review = await database.query(
    `
    DELETE FROM reviews 
    WHERE id = $1 AND user_id = $2 
    RETURNING *
    `,
    [reviewId, req.user.id]
  );

  if (review.rows.length === 0) {
    return next(new ErrorHandler("Review không tồn tại", 404));
  }

  res.status(200).json({
    success: true,
    message: "Đã xóa đánh giá",
    review: review.rows[0],
  });
});

//1 user xoa 1 review
// export const deleteReview = catchAsyncErrors(async (req, res, next) => {
//   const { productId } = req.params;
//   const review = await database.query(
//     "DELETE FROM reviews WHERE product_id = $1 AND user_id = $2 RETURNING *",
//     [productId, req.user.id]
//   );

//   if (review.rows.length === 0) {
//     return next(new ErrorHandler("Review not found.", 404));
//   }

//   const allReviews = await database.query(
//     `SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id = $1`,
//     [productId]
//   );

//   const newAvgRating = allReviews.rows[0].avg_rating;

//   const updatedProduct = await database.query(
//     `
//         UPDATE products SET ratings = $1 WHERE id = $2 RETURNING *
//         `,
//     [newAvgRating, productId]
//   );

//   res.status(200).json({
//     success: true,
//     message: "Your review has been deleted.",
//     review: review.rows[0],
//     product: updatedProduct.rows[0],
//   });
// });

export const fetchAIFilteredProducts = catchAsyncErrors(
  async (req, res, next) => {
    const { userPrompt } = req.body;
    if (!userPrompt) {
      return next(new ErrorHandler("Cung cấp yêu cầu hợp lệ", 400));
    }

    const filterKeywords = (query) => {
      const stopWords = new Set([
        "của",
        "cho",
        "và",
        "với",
        "một",
        "những",
        ".",
        ",",
        "!",
        "?",
        ">",
        "<",
        ";",
        "`",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
      ]);

      return query
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => !stopWords.has(word))
        .map((word) => `%${word}%`);
    };

    const keywords = filterKeywords(userPrompt);
    // STEP 1: Basic SQL Filtering
    const result = await database.query(
      `
        SELECT p.*,
        c.id as category_id,
        c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.name ILIKE ANY($1)
        OR p.description ILIKE ANY($1)
        OR c.name ILIKE ANY($1)
        LIMIT 200;     
        `,
      [keywords]
    );

    const filteredProducts = result.rows;

    if (filteredProducts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Không có sản phẩm theo yêu cầu của bạn",
        products: [],
      });
    }

    // STEP 2: AI FILTERING
    const { success, products } = await getAIRecommendation(
      req,
      res,
      userPrompt,
      filteredProducts
    );

    res.status(200).json({
      success: success,
      message: "AI đã lọc sản phẩm thành công",
      products,
    });
  }
);

// export const searchProductSuggest = catchAsyncErrors(async (req, res, next) => {
//   const { keyword } = req.query;

//   if (!keyword) return res.status(200).json({ success: true, products: [] });

//   const result = await database.query(
//     `
//     SELECT id, name, price, images
//     FROM products
//     WHERE unaccent(name) ILIKE unaccent($1)
//     ORDER BY ratings DESC
//     LIMIT 5
//     `,
//     [`%${keyword}%`]
//   );

//   res.status(200).json({ success: true, products: result.rows });
// });

export const searchProductSuggest = catchAsyncErrors(async (req, res) => {
  const { keyword } = req.query;

  if (!keyword || keyword.trim() === "") {
    return res.status(200).json({ success: true, products: [] });
  }

  const isShort = keyword.length <= 3;

  const result = await database.query(
    `
    SELECT 
      id, 
      name, 
      price, 
      images,
      ts_rank(search_vector, plainto_tsquery('simple', $1)) AS rank
    FROM products
    WHERE ${
      isShort
        ? `unaccent(name) ILIKE '%' || unaccent($1) || '%'`
        : `search_vector @@ plainto_tsquery('simple', $1)`
    }
    ORDER BY rank DESC
    LIMIT 5
    `,
    [keyword]
  );

  res.status(200).json({
    success: true,
    products: result.rows,
  });
});

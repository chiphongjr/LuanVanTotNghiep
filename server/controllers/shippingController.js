import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import database from "../database/db.js";

const GHN_HEADERS = {
  "Content-Type": "application/json",
  Token: process.env.GHN_TOKEN,
  ShopId: process.env.GHN_SHOP_ID,
};

export const getProvinces = catchAsyncErrors(async (req, res) => {
  const { data } = await axios.get(
    `${process.env.GHN_API}/master-data/province`,
    { headers: GHN_HEADERS }
  );

  res.status(200).json({
    success: true,
    provinces: data.data,
  });
});

export const getDistricts = catchAsyncErrors(async (req, res) => {
  const { province_id } = req.query;
  if (!province_id) throw new ErrorHandler("province_id is required", 400);

  const { data } = await axios.get(
    `${process.env.GHN_API}/master-data/district`,
    {
      headers: GHN_HEADERS,
      params: { province_id },
    }
  );

  res.status(200).json({
    success: true,
    districts: data.data,
  });
});

export const getWards = catchAsyncErrors(async (req, res) => {
  const { district_id } = req.query;
  if (!district_id) throw new ErrorHandler("district_id is required", 400);

  const { data } = await axios.get(`${process.env.GHN_API}/master-data/ward`, {
    headers: GHN_HEADERS,
    params: { district_id },
  });

  res.status(200).json({
    success: true,
    wards: data.data,
  });
});

export const calculateShippingFee = catchAsyncErrors(async (req, res) => {
  const { district_id, ward_code } = req.body;
  if (!district_id || !ward_code)
    throw new ErrorHandler("Missing address info", 400);

  const { data } = await axios.post(
    `${process.env.GHN_API}/v2/shipping-order/fee`,
    {
      from_district_id: 1442,
      from_ward_code: "21211",
      to_district_id: district_id,
      to_ward_code: ward_code,
      weight: 1000,
      service_type_id: 2, // ✅ BẮT BUỘC
    },
    { headers: GHN_HEADERS }
  );

  res.status(200).json({
    success: true,
    shipping_fee: data.data.total,
  });
});

export async function createGHNOrderInternal(order_id) {
  // 1️⃣ Order
  const {
    rows: [order],
  } = await database.query(`SELECT * FROM orders WHERE id = $1`, [order_id]);
  if (!order) throw new Error("Order not found");

  // 2️⃣ Shipping info
  const {
    rows: [shipping],
  } = await database.query(`SELECT * FROM shipping_info WHERE order_id = $1`, [
    order_id,
  ]);
  if (!shipping) throw new Error("Shipping info not found");

  // 3️⃣ Items
  const { rows: items } = await database.query(
    `
    SELECT p.name, oi.quantity, oi.price
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = $1
  `,
    [order_id]
  );

  if (!items.length) throw new Error("Order has no items");

  // 4️⃣ Payment
  const {
    rows: [payment],
  } = await database.query(
    `SELECT payment_type FROM payments WHERE order_id = $1`,
    [order_id]
  );
  if (!payment) throw new Error("Payment not found");

  // 5️⃣ GHN payload (sandbox-safe)
  const payload = {
    payment_type_id: 2,
    required_note: "KHONGCHOXEMHANG",

    from_name: "JrShop",
    from_phone: "0903073250",
    from_address: "Tân Bình, TP.HCM",
    from_district_id: 1442,
    from_ward_code: "21211",

    to_name: shipping.full_name,
    to_phone: shipping.phone,
    to_address: shipping.address,
    to_district_id: shipping.district_id,
    to_ward_code: shipping.ward_code,

    service_type_id: 2,
    weight: 1000,

    items: items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      weight: 500,
    })),
  };

  // 6️⃣ Call GHN
  const { data } = await axios.post(
    `${process.env.GHN_API}/v2/shipping-order/create`,
    payload,
    { headers: GHN_HEADERS }
  );

  // 7️⃣ Save order_code
  await database.query(`UPDATE orders SET ghn_order_code = $1 WHERE id = $2`, [
    data.data.order_code,
    order_id,
  ]);

  return {
    ghn_order_code: data.data.order_code,
  };
}

export const createGHNOrder = catchAsyncErrors(async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) throw new ErrorHandler("order_id is required", 400);

  const result = await createGHNOrderInternal(order_id);

  res.status(200).json({
    success: true,
    ...result,
  });
});



// import axios from "axios";
// import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
// import ErrorHandler from "../middlewares/errorMiddleware.js";
// import database from "../database/db.js";

// /* ================= GHN CONFIG (HARDCODE) ================= */
// const GHN_API = "https://dev-online-gateway.ghn.vn/shiip/public-api";
// const GHN_TOKEN = "78a7fc3b-ecba-11f0-a3d6-dac90fb956b5";
// const GHN_SHOP_ID = 199023;

// const GHN_HEADERS = {
//   "Content-Type": "application/json",
//   Token: GHN_TOKEN,
//   ShopId: GHN_SHOP_ID,
// };

// /* ================= GET PROVINCES ================= */
// export const getProvinces = catchAsyncErrors(async (req, res) => {
//   const { data } = await axios.get(
//     `${GHN_API}/master-data/province`,
//     { headers: GHN_HEADERS }
//   );

//   res.status(200).json({
//     success: true,
//     provinces: data.data,
//   });
// });

// /* ================= GET DISTRICTS ================= */
// export const getDistricts = catchAsyncErrors(async (req, res) => {
//   const { province_id } = req.query;
//   if (!province_id)
//     throw new ErrorHandler("province_id is required", 400);

//   const { data } = await axios.get(
//     `${GHN_API}/master-data/district`,
//     {
//       headers: GHN_HEADERS,
//       params: { province_id },
//     }
//   );

//   res.status(200).json({
//     success: true,
//     districts: data.data,
//   });
// });

// /* ================= GET WARDS ================= */
// export const getWards = catchAsyncErrors(async (req, res) => {
//   const { district_id } = req.query;
//   if (!district_id)
//     throw new ErrorHandler("district_id is required", 400);

//   const { data } = await axios.get(
//     `${GHN_API}/master-data/ward`,
//     {
//       headers: GHN_HEADERS,
//       params: { district_id },
//     }
//   );

//   res.status(200).json({
//     success: true,
//     wards: data.data,
//   });
// });

// /* ================= CALCULATE SHIPPING FEE ================= */
// export const calculateShippingFee = catchAsyncErrors(async (req, res) => {
//   const { district_id, ward_code } = req.body;

//   if (!district_id || !ward_code)
//     throw new ErrorHandler("Missing address info", 400);

//   const { data } = await axios.post(
//     `${GHN_API}/v2/shipping-order/fee`,
//     {
//       from_district_id: 1442, // Tân Bình
//       from_ward_code: "21211",
//       to_district_id: district_id,
//       to_ward_code: ward_code,
//       weight: 1000,
//       service_type_id: 2, // ⚠️ bắt buộc
//     },
//     { headers: GHN_HEADERS }
//   );

//   res.status(200).json({
//     success: true,
//     shipping_fee: data.data.total,
//   });
// });

// /* ================= CREATE GHN ORDER (INTERNAL) ================= */
// export async function createGHNOrderInternal(order_id) {
//   // 1️⃣ Order
//   const {
//     rows: [order],
//   } = await database.query(
//     `SELECT * FROM orders WHERE id = $1`,
//     [order_id]
//   );
//   if (!order) throw new Error("Order not found");

//   // 2️⃣ Shipping info
//   const {
//     rows: [shipping],
//   } = await database.query(
//     `SELECT * FROM shipping_info WHERE order_id = $1`,
//     [order_id]
//   );
//   if (!shipping) throw new Error("Shipping info not found");

//   // 3️⃣ Items
//   const { rows: items } = await database.query(
//     `
//     SELECT p.name, oi.quantity, oi.price
//     FROM order_items oi
//     JOIN products p ON p.id = oi.product_id
//     WHERE oi.order_id = $1
//     `,
//     [order_id]
//   );
//   if (!items.length) throw new Error("Order has no items");

//   // 4️⃣ Payload GHN
//   const payload = {
//     payment_type_id: 2,
//     required_note: "KHONGCHOXEMHANG",

//     from_name: "JrShop",
//     from_phone: "0903073250",
//     from_address: "Tân Bình, TP.HCM",
//     from_district_id: 1442,
//     from_ward_code: "21211",

//     to_name: shipping.full_name,
//     to_phone: shipping.phone,
//     to_address: shipping.address,
//     to_district_id: shipping.district_id,
//     to_ward_code: shipping.ward_code,

//     service_type_id: 2,
//     weight: 1000,

//     items: items.map((i) => ({
//       name: i.name,
//       quantity: i.quantity,
//       price: i.price,
//       weight: 500,
//     })),
//   };

//   // 5️⃣ Call GHN
//   const { data } = await axios.post(
//     `${GHN_API}/v2/shipping-order/create`,
//     payload,
//     { headers: GHN_HEADERS }
//   );

//   // 6️⃣ Save order_code
//   await database.query(
//     `UPDATE orders SET ghn_order_code = $1 WHERE id = $2`,
//     [data.data.order_code, order_id]
//   );

//   return {
//     ghn_order_code: data.data.order_code,
//   };
// }

// /* ================= CREATE GHN ORDER API ================= */
// export const createGHNOrder = catchAsyncErrors(async (req, res) => {
//   const { order_id } = req.body;
//   if (!order_id)
//     throw new ErrorHandler("order_id is required", 400);

//   const result = await createGHNOrderInternal(order_id);

//   res.status(200).json({
//     success: true,
//     ...result,
//   });
// });

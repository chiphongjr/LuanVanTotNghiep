import database from "../database/db.js";
import Stripe from "stripe";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export async function generatePaymentIntent(orderId, finalPrice) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalPrice,
      currency: "vnd",
    });

    await database.query(
      "INSERT INTO payments (order_id, payment_type, payment_status, payment_intent_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [orderId, "Online", "Pending", paymentIntent.id]
    );

    return { success: true, clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error("Payment Error:", error.message || error);
    return { success: false, message: "Payment Failed." };
  }
}

export async function cancelPaymentIntent(orderId) {
  try {
    const { rows } = await database.query(
      "SELECT id, payment_intent_id FROM payments WHERE order_id=$1",
      [orderId]
    );

    if (!rows.length) return { success: false, message: "Payment không tồn tại" };

    const payment = rows[0];

    // Hủy payment trên Stripe
    await stripe.paymentIntents.cancel(payment.payment_intent_id);

    // Cập nhật DB
    await database.query("UPDATE payments SET payment_status='Failed' WHERE id=$1", [
      payment.id,
    ]);

    return { success: true, message: "PaymentIntent đã bị hủy" };
  } catch (error) {
    console.error("Cancel Payment Error:", error.message);
    return { success: false, message: "Hủy paymentintent thất bại" };
  }
}

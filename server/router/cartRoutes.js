import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  addToCart,
  clearCart,
  getCart,
  removeCart,
  updateCart,
} from "../controllers/cartController.js";

const router = express.Router();
router.post("/add-cart", isAuthenticated, addToCart);
router.get("/cart", isAuthenticated, getCart);
router.put("/update-cart", isAuthenticated, updateCart);
router.delete("/remove-cart/:cart_item_id", isAuthenticated, removeCart);
router.delete("/clear-cart", isAuthenticated, clearCart);

export default router;

import express from "express";
import {
  createDiscount,
  fetchAllDiscount,
  validateDiscount,
} from "../controllers/discountController.js";
import {
  authorizedRoles,
  isAuthenticated,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/admin/create",
  isAuthenticated,
  authorizedRoles("Admin"),
  createDiscount
);

router.get(
  "/admin/fetch-all",
  isAuthenticated,
  authorizedRoles("Admin"),
  fetchAllDiscount
);

router.post("/validate-discount",isAuthenticated,validateDiscount);

export default router;

import express from "express";
import {
  createDiscount,
  fetchAllDiscount,
  updateDiscount,
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

router.post("/validate-discount", isAuthenticated, validateDiscount);

router.put(
  "/admin/update-discount/:discountId",
  isAuthenticated,
  authorizedRoles("Admin"),
  updateDiscount
);
export default router;

import express from "express";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import {
  authorizedRoles,
  isAuthenticated,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);

// Admin routes
router.post(
  "/admin/create",
  isAuthenticated,
  authorizedRoles("Admin"),
  createCategory
);

router.put(
  "/admin/update/:categoryId",
  isAuthenticated,
  authorizedRoles("Admin"),
  updateCategory
);

router.delete(
  "/admin/delete/:categoryId",
  isAuthenticated,
  authorizedRoles("Admin"),
  deleteCategory
);

export default router;

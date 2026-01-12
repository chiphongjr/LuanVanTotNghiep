import express from "express";
import {
  getProvinces,
  getDistricts,
  getWards,
  calculateShippingFee,
  createGHNOrder,
} from "../controllers/shippingController.js";

const router = express.Router();

router.get("/provinces", getProvinces);
router.get("/districts", getDistricts);
router.get("/wards", getWards);
router.post("/fee", calculateShippingFee);

router.post("/create-ghn-order",createGHNOrder);

export default router;

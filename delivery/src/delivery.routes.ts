import express from "express";
import type { RouteParams } from "./types/index.js";
import { authenticate, authorize } from "./delivery.middleware.js";
import deliveryController from "./delivery.controller.js";

const router = express.Router();

// Auth ile ilgili route'lar burada tanımlanacak
// Örneğin: register, login, logout, vs.

router.post("/couriers/register", deliveryController.register);
router.post("/couriers/login", deliveryController.login);
router.patch(
  "/couriers/status",
  authenticate,
  authorize(["courier"]),
  deliveryController.updateCourierStatus,
);
router.get(
  "/couriers/:courierId/performance",
  authenticate,
  authorize(["admin"]),
  deliveryController.getCourierPerformance,
);

router.get(
  "/orders",
  authenticate,
  authorize(["courier"]),
  deliveryController.getAvailableOrders,
);
router.post(
  "/orders/:orderId/accept",
  authenticate,
  authorize(["courier"]),
  deliveryController.acceptDelivery,
);
router.patch(
  "/orders/:orderId/status",
  authenticate,
  authorize(["courier"]),
  deliveryController.updateDeliveryStatus,
);
router.get(
  "/orders/:orderId/tracking",
  authenticate,
  deliveryController.trackDelivery,
);

router.get("/", async (req, res) => {
  return res.json({
    success: true,
    message: "Delivery Service is up and running",
  });
}) as RouteParams;

export default router;

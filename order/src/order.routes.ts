import express from "express";
import type { RouteParams } from "./types/index.js";
import { authenticate, authorize } from "./order.middleware.js";
import orderController from "./order.controller.js";

const router = express.Router();

router.post("/", authenticate, orderController.createOrder);
router.get("/:orderId", authenticate, orderController.getOrder);
router.get("/user/:userId", authenticate, orderController.getUserOrders);
router.patch(
  "/:orderId/status",
  authenticate,
  authorize(["admin", "restaurant_owner"]),
  orderController.updateOrderStatus,
);

router.get("/", async (req, res) => {
  return res.json({
    success: true,
    message: "Order Service is up and running",
  });
}) as RouteParams;
export default router;

import express from "express";
import type { RouteParams } from "./types/index.js";
import restaurantController from "./restaurant.controller.js";
import { authenticate, authorize } from "./restaurant.middleware.js";

const router = express.Router();

// Auth ile ilgili route'lar burada tanımlanacak
// Örneğin: register, login, logout, vs.

router.get("/", restaurantController.getAllRestaurants);
router.post(
  "/:id/menu",
  authenticate,
  authorize(["admin", "restaurant_owner"]),
  restaurantController.addMenuItem,
);
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  restaurantController.createRestaurant,
);
router.get("/:id", restaurantController.getRestaurant);

router.get("/:id/menu", restaurantController.getRestaurantMenu);

router.get("/", async (req, res) => {
  return res.json({
    success: true,
    message: "Restaurant Service is up and running",
  });
}) as RouteParams;
export default router;

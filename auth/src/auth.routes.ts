import express from "express";
import AuthController from "./auth.controller.ts";
import { type RouteParams } from "./types/index.ts";

const router = express.Router();

// Auth ile ilgili route'lar burada tanımlanacak
// Örneğin: register, login, logout, vs.

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

router.get("/", async (req, res) => {
  return res.json({
    success: true,
    message: "Auth Service is up and running",
  });
}) as RouteParams;

export default router;

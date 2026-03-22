import express from "express";
import type { RouteParams } from "./types/index.js";

const router = express.Router();

// Auth ile ilgili route'lar burada tanımlanacak
// Örneğin: register, login, logout, vs.

router.post("/register", (req, res) => {});
router.post("/login", (req, res) => {});

router.get("/", async (req, res) => {
  return res.json({
    success: true,
    message: "Delivery Service is up and running",
  });
}) as RouteParams;

export default router;

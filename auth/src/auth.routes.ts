import express from "express";
import AuthController from "./auth.controller.ts";

const router = express.Router();

// Auth ile ilgili route'lar burada tanımlanacak
// Örneğin: register, login, logout, vs.

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

export default router;

import authService from "./auth.service.ts";
import type { RouteParams } from "./types/index.ts";

class AuthController {
  register: RouteParams = async (req, res, next) => {
    try {
      // register islemi burada yapilacak

      authService.login();
      res.status(201).json({
        status: "success",
        message: "User registered successfully!",
      });
    } catch (err) {
      next(err);
    }
  };

  login: RouteParams = async (req, res, next) => {
    try {
      // login islemi burada yapilacak

      authService.login();
      res.status(200).json({
        status: "success",
        message: "User logged in successfully!",
      });
    } catch (err) {
      next(err);
    }
  };
}

export default new AuthController(); // kullanilacak yerlerde new ile yazmaya gerek yok

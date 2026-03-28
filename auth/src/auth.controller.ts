import {
  addressSchema,
  loginSchema,
  registerSchema,
  validateDto,
} from "./auth.dto.ts";
import authService from "./auth.service.ts";
import type { RouteParams, ValidationResult } from "./types/index.ts";
import catchAsync from "./utils/index.ts";

class AuthController {
  register = catchAsync(async (req, res, next) => {
    const result = registerSchema.safeParse(req.body);

    // * validasyonların yapılacağı fonksiyonu yazdık.
    const validationResult: ValidationResult = await validateDto(
      registerSchema,
      req.body,
    );

    if (validationResult.status === "fail") {
      return res.status(400).json({
        status: "fail",
        messages: validationResult.messages,
      });
    }
    // ^ Eğer hata varsa yani validasyon başarılı değilse o zaman hata mesajları derleyip response olarak gönder
    /* if (!result.success) {
      //console.log(JSON.parse(result.error.message));
      //console.log(Object.entries(JSON.parse(result.error.message)));

      const message = Object.entries(JSON.parse(result.error.message)).map(
        (item: [string, any], index: number) => item[1].message,
      );
      return res.status(400).json({
        status: "fail",
        fail_type: "validation fail",
        error_messages: message,
      });
    } */

    const savedUser = await authService.register(req.body).catch((err) => {
      next(err);
    });

    console.log(savedUser);
    return res.status(201).json({
      status: "success",
      message: "User registered successfully!",
      data: savedUser,
    });
  });

  login = catchAsync(async (req, res, next) => {
    const validateResult: ValidationResult = await validateDto(
      loginSchema,
      req.body,
    );

    if (validateResult.status === "fail") {
      return res.status(400).json({
        status: "fail",
        messages: validateResult.messages,
      });
    }
    authService.login();
    res.status(200).json({
      status: "success",
      message: "User logged in successfully!",
    });
  });

  refresh = catchAsync(async (req, res, next) => {});
  logout = catchAsync(async (req, res, next) => {});
  getProfile = catchAsync(async (req, res, next) => {});
  addAddress = catchAsync(async (req, res, next) => {
    const validateStatus: ValidationResult = await validateDto(
      addressSchema,
      req.body,
    );

    if (validateStatus.status === "fail") {
      return res.status(400).json({
        status: "fail",
        messages: validateStatus.messages,
      });
    }
  });
}

export default new AuthController(); // kullanilacak yerlerde new ile yazmaya gerek yok

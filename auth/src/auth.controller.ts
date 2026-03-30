import {
  addressSchema,
  loginSchema,
  registerSchema,
  validateDto,
} from "./auth.dto.ts";
import authService from "./auth.service.ts";
import type {
  IAuthResponse,
  RouteParams,
  ValidationResult,
} from "./types/index.ts";
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
      return null;
    });

    // cookieleri belirle
    res.cookie("refreshToken", savedUser?.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", savedUser?.accessToken, {
      httpOnly: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

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
    const data = await authService.login(req.body).catch((err) => next(err));

    // cookieleri belirle
    res.cookie("refreshToken", data?.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", data?.accessToken, {
      httpOnly: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: "success",
      message: "User logged in successfully!",
      data,
    });
  });

  refresh = catchAsync(async (req, res, next) => {
    const refreshToken =
      req.cookies.refreshToken || req.headers.authorization?.substring(7);

    if (!refreshToken)
      return res.status(401).json({
        status: "fail",
        message: "Refresh Token Bukunamadı",
      });

    const result: { accessToken: string } | null = await authService
      .refresh(refreshToken)
      .catch((err) => {
        next(err);
        return null;
      });

    res.cookie("accessToken", result?.accessToken, {
      httpOnly: true,
      maxAge: 1 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      message: "Token yenilendi.",
      data: result,
    });
  });

  logout = catchAsync(async (req, res, next) => {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.status(200).json({
      status: "success",
      message: "Başarılı şekilde çıkış yapıldı.",
    });
  });

  getProfile = catchAsync(async (req, res, next) => {
    const user = req.user;

    res.status(200).json({
      status: "success",
      message: "Kullanıcı başarılı bir şekilde bulundu!",
      data: user,
    });
  });

  addAddress = catchAsync(async (req, res, next) => {
    const validateStatus: ValidationResult = await validateDto(
      addressSchema,
      req.body,
    );

    const userId = req.user?._id;

    if (validateStatus.status === "fail") {
      return res.status(400).json({
        status: "fail",
        messages: validateStatus.messages,
      });
    }

    const result = await authService
      .addAddress(userId!, req.body)
      .catch((err) => next(err));

    res.status(201).json(result);
  });
}

export default new AuthController(); // kullanilacak yerlerde new ile yazmaya gerek yok

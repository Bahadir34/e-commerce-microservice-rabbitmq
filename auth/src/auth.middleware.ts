import type { NextFunction, Request, Response } from "express";
import User from "./auth.model.ts";
import jwt from "jsonwebtoken";
import type { IJwtPayload } from "./types/index.ts";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const accessToken =
      req.cookies.accessToken || req.headers.authorization?.substring(7);

    console.log(req.headers);

    if (!accessToken) {
      res.status(401).json({
        status: "fail",
        message: "Token bulunamadı",
      });
      return;
    }

    const { userId } = jwt.verify(
      accessToken,
      process.env.JWT_SECRET,
    ) as IJwtPayload;

    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      res.status(401).json({
        status: "fail",
        message: "Geçersiz token veya kullanıcı hesabı aktif değil!",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: "fail",
        message: "Geçersiz token!",
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: "fail",
        message: "Token süresi dolmuş!",
      });
    } else {
      res.status(401).json({
        status: "fail",
        message: "Token doğrulama hatası!",
      });
    }
  }
};

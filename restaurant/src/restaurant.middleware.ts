import { type NextFunction, type Request, type Response } from "express";
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

    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET,
    ) as IJwtPayload;

    req.user = decoded;

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

// ^ rol kontrolu
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: "fail",
        message: "Kullanıcı kimlik doğrulaması gereklidir!",
      });

      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: "fail",
        message: "Bu işlem için yetkiniz bulunmamaktadır!",
      });
      return;
    }

    next();
  };
};

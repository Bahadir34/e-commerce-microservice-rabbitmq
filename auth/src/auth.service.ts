// Bussiness logic burada yonetilir ve veritabani ile iletisime gecilecek olan katman

import type { NextFunction, RequestHandler } from "express";
import type { RegisterInput } from "./auth.dto.ts";
import User from "./auth.model.ts";
import type { IUser } from "./types/index.ts";

class AuthService {
  constructor() {}

  async register(user: RegisterInput): Promise<IUser | Error> {
    const existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      throw new Error("Email zaten kullanımda.");
    }

    const createdUser = new User(user);
    const savedUser = await createdUser.save();

    // * Client'a vermek istediğim bilgiler burada
    // todo : response ayarlanacak, aynı zamanda tipi de tanımlanmalı
    return {
      status: "success",
      data: {
        user: {
          id: savedUser._id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          addresses: savedUser.addresses,
          phone: savedUser.phone,
          role: savedUser.role,
          isActive: savedUser.isActive,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt,
        },
        accessToken: "",
        refreshToken: "",
      },
    };
  }
  async login(): Promise<string> {
    return "Kullanici Verisi";
  }
}

export default new AuthService();

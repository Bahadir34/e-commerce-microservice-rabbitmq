// Bussiness logic burada yonetilir ve veritabani ile iletisime gecilecek olan katman

import type { AddressInput, LoginInput, RegisterInput } from "./auth.dto.ts";
import User from "./auth.model.ts";
import type {
  IAddress,
  IAuthResponse,
  IJwtPayload,
  IUser,
} from "./types/index.ts";
import jwt from "jsonwebtoken";

class AuthService {
  constructor() {}

  private generateTokens(user: IUser) {
    const accessToken = jwt.sign(
      { userId: user?._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXP } as jwt.SignOptions,
    );

    const refreshToken = jwt.sign(
      { userId: user?._id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXP } as jwt.SignOptions,
    );

    return { accessToken, refreshToken };
  }

  async register(user: RegisterInput): Promise<IAuthResponse> {
    const existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      throw new Error("Email zaten kullanımda.");
    }

    const createdUser = new User(user);
    const savedUser = await createdUser.save();

    const tokens = this.generateTokens(savedUser);

    // * Client'a vermek istediğim bilgiler burada
    // todo : response ayarlanacak, aynı zamanda tipi de tanımlanmalı
    return {
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
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(loginData: LoginInput): Promise<IAuthResponse> {
    // Kullanici Kontrolu
    const existingUser = await User.findOne({ email: loginData.email });

    if (!existingUser) throw new Error("Geçersiz email veya şifre!");

    // Sifre kontrolu
    const isPassValid = await existingUser.comparePassword(loginData.password);

    if (!isPassValid) throw new Error("Geçersiz email veya şifre!");

    const tokens = this.generateTokens(existingUser);

    return {
      user: {
        id: existingUser._id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        addresses: existingUser.addresses,
        phone: existingUser.phone,
        role: existingUser.role,
        isActive: existingUser.isActive,
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
    ) as IJwtPayload;

    const user = await User.findById(decodedToken.userId);

    if (!user) throw new Error("Geçersiz refresh token!");

    const token = this.generateTokens(user);

    return { accessToken: token.accessToken };
  }

  async addAddress(
    userId: string,
    addressData: AddressInput,
  ): Promise<{ status: string; data: { addresses: IAddress[] | undefined } }> {
    const user = await User.findById(userId);

    // * eger yeni adres varsayilan adres ise diger adresleri varsayilandan cikar

    if (addressData.isDefault) {
      user?.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    // * yeni adres ekle
    user?.addresses.push(addressData);

    await user?.save();

    return {
      status: "success",
      data: {
        addresses: user?.addresses,
      },
    };
  }
}

export default new AuthService();

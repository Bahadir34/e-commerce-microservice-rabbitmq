import type { NextFunction, Request, Response } from "express";
import type { Types } from "mongoose";
import { extend } from "zod/mini";

export type RouteParams = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export type ValidationResult = {
  status: String;
  messages: String[] | String;
};

export type UserRole = "customer" | "restaurant_owner" | "admin" | "courier";
// ^ Mongoose modeli olduğu için 'Document' ı extend ettik.
export interface IUser extends Document {
  _id?: string;

  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  addresses: IAddress[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

export interface IAddress {
  _id?: string;
  title: string;
  address: string;
  city: string;
  district: string;
  postalCode: number;
  isDefault: boolean;
}

export interface IJwtPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// * siparis tipleri
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface IOrderItem {
  productId: Types.ObjectId | string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  id?: Types.ObjectId | string;
  _id?: Types.ObjectId | string;
  password?: string;
  userId: Types.ObjectId | string;
  restaurantId: Types.ObjectId | string;
  items: IOrderItem[];
  totalAmount: number;
  deliveryAddress: IAddress;
  paymentMethod: "credit_card" | "cash" | "online";
  status: OrderStatus;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

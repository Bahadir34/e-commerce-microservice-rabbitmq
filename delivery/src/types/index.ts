import type { NextFunction, Request, Response } from "express";
import type { Document, Types } from "mongoose";

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
  _id: Types.ObjectId;
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

// teslimat
export type DeliveryStatus =
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "failed";

export interface ILocation {
  latiude: number;
  longtitude: number;
}

export interface IDeliveryTracking extends Document {
  orderId: Types.ObjectId | string;
  courierId: Types.ObjectId | string;
  status: DeliveryStatus | "pending" | "ready";
  location?: ILocation;
  estimatedDeliveryTime?: Date; // * tahmini teslimat suresi
  actualDeliveryTime?: Date; // * teslim edilme suresi
  notes?: string;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CourierStatus = "available" | "busy" | "offline";

export interface ICourier extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  vehicleType: "motorcycle" | "bicycle" | "car";
  vehiclePlate?: string;
  status: CourierStatus;
  isAvailable: boolean;
  role: "courier" | "admin";
  location: ILocation;
  createdAt: Date;
  updatedAt: Date;
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

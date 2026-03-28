import type { NextFunction, Request, Response } from "express";

export type RouteParams = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void> | any;

export type ValidationResult = {
  status: String;
  messages: String[] | String;
};

export type UserRole = "customer" | "restaurant_owner" | "admin" | "courier";

export interface IAddress {
  _id: string;
  title: string;
  address: string;
  city: string;
  district: string;
  postalCode: number;
  isDefault: boolean;
}

// ^ Mongoose modeli olduğu için 'Document' ı extend ettik.
export interface IUser extends Document {
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

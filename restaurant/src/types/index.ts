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

// ^ Opening Hours Type
export interface IOpeningHours {
  monday: String;
  tuesday: String;
  wednesday: String;
  thursday: String;
  friday: String;
  saturday: String;
  sunday: String;
}

// ^ Restaurant Type
export interface IRestaurant extends Document {
  // * mongoose dokumani oldugu icin Documenti extends ettik
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  categories: String[];
  deliveryTime: Number;
  minOrder: Number;
  deliveryFee: Number;
  rating: Number;
  isActive: Boolean;
  isOpen: Boolean;
  openingHours: IOpeningHours;
  ownerId: String;
  createdAt: Date;
  updatedAt: Date;
}

// ^ Menu Item Type
export interface IMenuItem extends Document {
  restaurantId: Types.ObjectId; // * referanslarin tipi bu sekilde tanimlanir.
  name: String;
  description: String;
  price: Number;
  category: String;
  imageUrl: String;
  ingredients: String[];
  allergens: String[];
  isVegeterian: Boolean;
  isAvailable: Boolean;
  preparationTime: Number;
  createdAt: Date;
  updatedAt: Date;
}

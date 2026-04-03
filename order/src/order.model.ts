import { model, Schema, Types } from "mongoose";
import type { IAddress, IOrder, IOrderItem } from "./types/index.js";

// todo : Model tam olarak olusturulacak
const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  {
    _id: false, // ! kendisine ait bir id'si olmasin
  },
);

// * siparis teslimat adresi semasi
const addressSchema = new Schema<IAddress>(
  {
    title: {
      type: String,
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: Number, required: true },
    isDefault: { type: Boolean, required: true },
  },
  {
    _id: false, // ! kendisine ait bir id'si olmasin
  },
);

// * siparis modeli
const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    restaurantId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      type: addressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["credit_card", "online", "cash"],
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "on_the_way",
        "delivered",
        "cancelled",
      ],
    },

    specialInstructions: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc: any, ret: IOrder) {
        ret.id = ret._id as Types.ObjectId | string;
        delete doc._id;
        delete doc.__v;
        delete ret.password;
      },
    },
  },
);

const Order = model("Order", orderSchema);
export default Order;

import { model, Schema } from "mongoose";
import type { ICourier, IDeliveryTracking } from "./types/index.js";
import bcrypt from "bcrypt";

const locationSchema = new Schema(
  {
    latitude: { type: Number, required: true },
    longtitude: { type: Number, required: true },
  },
  {
    _id: false,
  },
);

// todo : Model tam olarak olusturulacak
const courierSchema = new Schema<ICourier>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ["motorcycle", "bicycle", "car"],
    },
    vehiclePlate: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["courier", "admin"],
    },
    status: {
      type: String,
      required: true,
      enum: ["available", "busy", "offline"],
    },
    location: [locationSchema],
  },
  {
    timestamps: true,
    toJSON: {
      // todo : Gecici olarak any type i verildi, model tam olarak yazilinca duzeltilecek
      transform: function (doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
      },
    },
  },
);

courierSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

const deliveryTrackingSchema = new Schema<IDeliveryTracking>(
  {
    orderId: {
      type: String,
      required: true,
    },
    courierId: {
      type: Schema.Types.ObjectId,
      ref: "Courier",
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "ready",
        "assigned",
        "picked_up",
        "in_transit",
        "delivered",
        "failed",
      ],
      default: "pending",
    },
    location: [locationSchema],
    estimatedDeliveryTime: {
      type: Date,
    },
    actualDeliveryTime: {
      type: Date,
    },
    notes: {
      type: String,
    },
    acceptedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc: any, ret: any, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
      },
    },
  },
);

const Courier = model("Courier", courierSchema);
const DeliveryTracking = model("DeliveryTracking", deliveryTrackingSchema);
export { Courier, DeliveryTracking };

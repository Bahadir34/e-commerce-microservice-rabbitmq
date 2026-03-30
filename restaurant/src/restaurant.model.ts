import { model, Schema } from "mongoose";
import { ref } from "node:process";
import { string } from "zod";
import { required } from "zod/mini";
import type { IMenuItem, IOpeningHours, IRestaurant } from "./types/index.js";

// * Acilis saatleri
const openingHoursSchema = new Schema<IOpeningHours>({
  monday: {
    type: String,
    required: true,
  },
  tuesday: {
    type: String,
    required: true,
  },
  wednesday: {
    type: String,
    required: true,
  },
  thursday: {
    type: String,
    required: true,
  },
  friday: {
    type: String,
    required: true,
  },
  saturday: {
    type: String,
    required: true,
  },
  sunday: {
    type: String,
    required: true,
  },
});

// * Restaurant Semasi
const restaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    categories: {
      type: [String],
      default: [],
      required: true,
    },
    deliveryTime: {
      type: Number,
      required: true,
    },
    minOrder: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isOpen: {
      type: Boolean,
      defaultu: true,
    },
    openingHours: {
      type: openingHoursSchema,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
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

// * Urun Semasi
const menuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    allergens: {
      type: [String],
      default: [],
    },
    isVegeterian: {
      type: Boolean,
      required: true,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
    preparationTime: {
      type: Number,
      min: 0,
      required: true,
    },
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

const Restaurant = model("Restaurant", restaurantSchema);
const MenuItem = model("MenuItem", menuItemSchema);

export { Restaurant, MenuItem };

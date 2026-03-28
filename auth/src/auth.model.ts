import { model, Schema } from "mongoose";
import type { IAddress, IUser } from "./types/index.ts";
import bcrypt from "bcrypt";
import { email } from "zod";
// * Adres Şeması

const addressSchema = new Schema<IAddress>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: Number,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true, // * Bütün sub-document'ların kendi id leri olur
  },
);

// todo : Model tam olarak olusturulacak
// * Kullanıcı Şeması
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "customer", "courier", "restaurant_owner"],
    },
    addresses: {
      type: [addressSchema], // * embedded gibi davranır.
    },

    isActive: {
      type: Boolean,
    },
    lastLogin: {
      type: Date,
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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// Şİfre karşılaştırma metodu
// * Bu method IUser tipine de eklendi.
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// indexler : aramalarda hızı arttırır, performans kazancı sağlar
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = model("User", userSchema);

export default User;

import { timeStamp } from "node:console";
import * as z from "zod";
import type { ValidationResult } from "./types/index.js";

// * courier register schema
const courierRegisterSchema = z.object({
  email: z.email("Lütfen geçerli bir email giriniz!"),
  password: z.string().min(6, "Şifre en az 6 karakterden oluşmalıdır."),
  firstName: z.string().min(2, "İsim en az 2 karakterden oluşmalıdır."),
  lastName: z.string().min(2, "İsim en az 2 karakterden oluşmalıdır."),
  vehicleType: z.enum(["motorcycle", "car", "bicycle"], {
    error: function () {
      return "Geçerli bir araç tipi giriniz!";
    },
  }),
  phone: z
    .string()
    .min(10, "Telefon numarası en az 10 karakterden oluşmalıdır."),
  vehiclePlate: z.string().optional(),
  isAvailable: z.boolean().default(true),
});

const courierLoginSchema = z.object({
  email: z.email("Lütfen geçerli bir email giriniz!"),
  password: z.string().min(6, "Şifre en az 6 karakterden oluşmalıdır."),
});

const courierStatusUpdateSchema = z.object({
  status: z.enum(["available", "busy", "offline"], {
    error: function () {
      return "Geçerli bir kurye durumu giriniz!";
    },
  }),
  location: z
    .object({
      latitude: z
        .number()
        .min(-90, "Enlem değeri -90'dan küçük olamaz.")
        .max(90, "Enlem değeri 90'dan büyük olamaz."),
      longtitude: z
        .number()
        .min(-180, "Enlem değeri -180'den küçük olamaz.")
        .max(180, "Enlem değeri 180'den büyük olamaz."),
    })
    .optional(),
});

// delivery status update schema
const deliveryStatusUpdateSchema = z.object({
  status: z.enum([
    "assigned",
    "picked_up",
    "in_transit",
    "delivered",
    "failed",
  ]),
  location: z
    .object({
      latitude: z
        .number()
        .min(-90, "Enlem değeri -90'dan küçük olamaz.")
        .max(90, "Enlem değeri 90'dan büyük olamaz."),
      longtitude: z
        .number()
        .min(-180, "Enlem değeri -180'den küçük olamaz.")
        .max(180, "Enlem değeri 180'den büyük olamaz."),
    })
    .optional(),
  estimatedArrival: z
    .number()
    .min(1, " Tahmini teslimat süresi 1 dakikadan az olamaz.")
    .optional(),
  actualArrival: z.date().optional(),
  notes: z.string().optional(),
});

const courierPerformanceSchema = z.object({
  deliveriesCompleted: z
    .number()
    .min(0, "Toplam teslimat sayısı en az 0 olmalıdır."),
  totalEarnings: z.number().min(0, "Toplam gelir en az 0 olmalıdır."),
  averageRating: z
    .number()
    .min(0, "Değerlendirme en az 0 olabilir.")
    .max(5, "Değerlendirme en fazla 5 olabilir."),
  period: z.enum(["daily", "weekly", "monthly"]),
});

// location update schema
const locationUpdateSchema = z.object({
  latitude: z
    .number()
    .min(-90, "Enlem değeri -90'dan küçük olamaz.")
    .max(90, "Enlem değeri 90'dan büyük olamaz."),
  longtitude: z
    .number()
    .min(-180, "Enlem değeri -180'den küçük olamaz.")
    .max(180, "Enlem değeri 180'den büyük olamaz."),
  timeStamp: z.date(),
});

export type CourierRegisterInput = z.infer<typeof courierRegisterSchema>;
export type CourierLoginInput = z.infer<typeof courierLoginSchema>;
export type CourierStatusInput = z.infer<typeof courierStatusUpdateSchema>;
export type DeliveryStatusUpdateInput = z.infer<
  typeof deliveryStatusUpdateSchema
>;
export type CourierPerformanceInput = z.infer<typeof courierPerformanceSchema>;
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;

// * Bir şema ve veri alıp verinin şemaya uygun olup olmadığını kontrol eden bir fonksiyon yazalım
async function validateDto<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): Promise<ValidationResult> {
  const result = await schema.safeParseAsync(data);
  let messages: string[] | string = "Validasyon başarılı.";
  console.log(result);
  if (!result.success) {
    messages = z.prettifyError(result.error);
    messages = messages.split("✖");
    messages.shift();
    messages = messages.map((item) => item.replaceAll("\n", ""));

    console.log(messages);
    /* messages = JSON.parse(result.error.message).map(
      (item: { message: String; path: String[] }) => {
        return {
          path: item.path[0],
          message: item.message,
        };
      },
    ); */
  }

  return {
    status: result.success ? "success" : "fail",
    messages,
  };
}

export {
  courierRegisterSchema,
  courierLoginSchema,
  courierStatusUpdateSchema,
  deliveryStatusUpdateSchema,
  courierPerformanceSchema,
  locationUpdateSchema,
  validateDto,
};

import * as z from "zod";
import type { ValidationResult } from "./types/index.js";

// * addressDto
const addressSchema = z.object({
  title: z.string().default(""),
  address: z.string().min(1, "Adres alanı zorunludur."),
  city: z.string().min(1, "Şehir alanı zorunludur."),
  district: z.string().min(1, "Mahalle alanı zorunludur."),
  postalCode: z.number().min(1, "Posta Kodu alanı zorunludur."),
  isDefault: z.boolean().default(false),
});

// * orderItem Dto
const orderItemSchema = z.object({
  productId: z.string().min(1, "Ürün ID numarası zorunlu alandır."),
  name: z.string().min(1, "Ürün Adı alanı zorunludur."),
  price: z.number().min(1, "Ürün Fiyatı alanı zorunludur."),
  quantity: z.number().min(1, "Ürün Adedi alanı zorunludur."),
});

// * order Dto

const orderSchema = z.object({
  restaurantId: z.string().min(1, "Restoran ID alanı zorunludur."),
  items: z.array(orderItemSchema).min(1, "En az 1 ürün seçilmelidir."),
  deliveryAddress: addressSchema,
  paymentMethod: z.enum(["credit_card", "cash", "online"], {
    error: () => {
      return "Geçerli bir ödeme yöntemi seçiniz";
    },
  }),
  specialInstructions: z.string().optional(),
});

const orderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "on_the_way",
    "delivered",
    "cancelled",
  ]),
  reason: z.string().optional(),
});

// * queryParams dto
const queryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z
    .enum([
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "on_the_way",
      "delivered",
      "cancelled",
    ])
    .optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// * Yukarida olusturlan semalardan typescript type'i olusturalim

export type AddressInput = z.infer<typeof addressSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type QueryParamsInput = z.infer<typeof queryParamsSchema>;

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
  addressSchema,
  orderItemSchema,
  orderSchema,
  orderStatusSchema,
  queryParamsSchema,
  validateDto,
};

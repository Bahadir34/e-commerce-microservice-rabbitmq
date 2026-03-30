import * as z from "zod";
import type { ValidationResult } from "./types/index.js";

// * openingHours Sema
const openingHoursSchema = z.object({
  monday: z.string().min(1, "Pazartesi çalışma saatleri zorunludur."),
  tuesday: z.string().min(1, "Salı çalışma saatleri zorunludur."),
  wednesday: z.string().min(1, "Çarşamba çalışma saatleri zorunludur."),
  thursday: z.string().min(1, "Perşembe çalışma saatleri zorunludur."),
  friday: z.string().min(1, "Cuma çalışma saatleri zorunludur."),
  saturday: z.string().min(1, "Cumartesi çalışma saatleri zorunludur."),
  sunday: z.string().min(1, "Pazar çalışma saatleri zorunludur."),
});

// * Restaurant Sema
const restaurantSchema = z.object({
  name: z.string().min(1, "Restoran ismi zorunludur."),
  description: z.string().min(1, "Açıklama alanı zorunludur."),
  address: z.string().min(1, "Adres alanı zorunludur."),
  phone: z.string().min(1, "Telefon alanı zorunludur."),
  email: z.email("Lütfen email formatını doğru giriniz."),
  categories: z
    .array(z.string())
    .min(1, "Ena az bir adet kategori seçiniz.")
    .default([]),
  deliveryTime: z
    .number()
    .min(15, "Teslimat süresi en az 15 dakika olmalıdır.")
    .max(120, "Teslimat süresi 120 dakikadan fazla olamaz."),
  minOrder: z
    .number()
    .min(0, "Teslimat için gereken en az sipariş tutarı 0'dan az olamaz."),
  deliveryFee: z.number().min(0, "Teslimat ücreti 0'dan az olamaz."),
  rating: z
    .number()
    .min(0, "Derecelendirme zorunlu alandır.")
    .max(5, "Derecelendirme 5'den fazla olamaz.")
    .default(0),
  isActive: z.boolean().default(true),
  isOpen: z.boolean().default(true),
  openingHours: openingHoursSchema,
  ownerId: z.string().min(1, "Restoran sahibinin girilmesi zorunludur."),
});

const menuItemSchema = z.object({
  name: z.string().min(1, "Restoran ismi zorunlu alandır."),
  description: z.string().min(5, "Restoran açıklaması zorunlu alandır."),
  price: z.number().min(0, "Menü ücreti 0₺ den az olamaz."),
  category: z.string().min(1, "Kategori alani zorunludur."),
  imageUrl: z.url("Geçerli bir resim URL'i giriniz.").optional(),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  isVegeterian: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  preparationTime: z
    .number()
    .min(5, "Hazırlık süreci 5 dk'dan az olamaz.")
    .max(120, "Hazırlık süreci 120 dk'dan fazla olamaz."),
});

// ^ queryParams sema
const queryParamsSchema = z.object({
  // * parametrelerin hepsi string tipinde gelir, bu veriyi transform ederiz int'e
  page: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().min(1)) // * donusturulmus ciktiyi dogrulama islemidir.
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  category: z.string().optional(),
  rating: z.string().min(0).max(5).optional(),
  deliveryTime: z.coerce.number().int().min(15).max(120).optional(),
  minOrder: z.coerce.number().int().min(0).optional(),
});

// ^ queryParams type
export type QueryParamsInput = z.infer<typeof queryParamsSchema>;

// ^ dto larin tipleri olusturuldu.
export type RestaurantInput = z.infer<typeof restaurantSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type OpeningHoursInput = z.infer<typeof openingHoursSchema>;

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
  validateDto,
  restaurantSchema,
  menuItemSchema,
  openingHoursSchema,
  queryParamsSchema,
};

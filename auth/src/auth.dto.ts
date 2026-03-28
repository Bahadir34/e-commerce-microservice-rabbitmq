import * as z from "zod";
import type { ValidationResult } from "./types/index.ts";

// ^ Zod Schemas
/*
    * Zod Şeması sayesinde kullanıcının gönderdiği bodyde bulunan veriyi        filtreleyebiliriz.
    
 */

const registerSchema = z.object({
  email: z.string().email("Geçerli bir email formatı giriniz."),
  firstName: z
    .string()
    .max(20, "İsim en fazla 20 karakterden oluşabilir.")
    .min(2, "İsim en az 2 karakterden oluşabilir."),
  lastName: z
    .string()
    .max(20, "Soyisim en fazla 20 karakterden oluşabilir.")
    .min(2, "Soyisim en az 2 karakterden oluşabilir."),
  password: z
    .string()
    .min(6, "Şifre en az 6 karakterden oluşmalıdır.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>?/\\|`~]).{8,}$/,
      "Şifre en az 1 küçük harf, 1 büyük harf, 1 sayı ve 1 özel karakter içermelidir.",
    ),
  phone: z.string(),
  role: z
    .enum(
      ["customer", "restaurant_owner", "courier", "admin"],
      "Lütfen geçerli bir rol giriniz.",
    )
    .default("customer"),
});
const loginSchema = z.object({
  email: z.string().email("Geçerli bir email formatı giriniz."),

  password: z
    .string()
    .min(6, "Şifre en az 6 karakterden oluşmalıdır.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>?/\\|`~]).{8,}$/,
      "Şifre en az 1 küçük harf, 1 büyük harf, 1 sayı ve 1 özel karakter içermelidir.",
    ),
});

const addressSchema = z.object({
  title: z
    .string("Adres için lütfen bir metin giriniz")
    .min(1, "Adres başlığı zorunludur.")
    .max(100, "Adres Başlığı en fazla 100 karakter içermelidir."),
  address: z
    .string()
    .min(2, "Adres alanı zorunludur.")
    .max(300, "Adres alanı en fazla 300 karakter içermelidir."),
  city: z.string().min(2, "Şehir zorunludur"),
  district: z.string().min(2, "İlçe zorunludur."),
  postalCode: z.number().min(1, "Posta Kodu zorunludur."),
  isDefault: z.boolean().default(false),
});

// ! zod kullanırsak oluşturduğumuz şemalar üzerinden typescript tipleri oluşturabiliyoruz.
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

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

export { registerSchema, loginSchema, addressSchema, validateDto };

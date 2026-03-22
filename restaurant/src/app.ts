// express uygulamasi olusturuluyor
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import router from "./restaurant.routes.js";

dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ - > MongoDB Baglantisi Basarili");
  })
  .catch((err) => {
    console.error("❌ - > MongoDB Baglantisi Basarisiz:", err);
  });

// middleware tanimla
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(morgan("dev")); // gelistirme asamasinda loglama icin kullanilir, hangi istek atildiysa onlari yazar

// rate limit middleware'i ekle
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW), // 15 dakika
  max: parseInt(process.env.RATE_LIMIT_MAX_REQ), // her IP adresi için 15 dakikada maksimum 100 istek
});
app.use(limiter);

// proje routlarimiz.
app.use(router);

// hata middlewarei
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // burada hata loglama islemi yapilabilir
  // ornegin: winston, bunyan gibi loglama kutuphaneleri kullanilabilir
  const message = err.message || "Something went wrong!";
  console.log(message);
  res.status(500).json({
    status: "fail",
    message: message,
  });
});

// 404 middleware'i yazilsin, atilan adres routelarda yoksa bu middleware devreye girecek ve kullaniciya 404 hatasi donulecek
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: "fail",
    message: "No such address you want to reach!",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`🖥️ - > App ${process.env.PORT} Portunda Calisiyor`);
});

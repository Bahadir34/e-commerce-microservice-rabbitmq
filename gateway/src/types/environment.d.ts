import type { IUser } from "./index.ts";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      JWT_EXP: string;
      JWT_REFRESH_EXP: string;
      RABBITMQ_URL: string;
      MONGODB_URI: string;
      RATE_LIMIT_WINDOW: string;
      RATE_LIMIT_MAX_REQ: string;
    }
  }

  // * Express in Request tipini ozellestirmis olduk, user adinda IUser tipinde bir degisken ekleyebilirim.
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
// * Boş objenin export edilmesi önemlidir, aksi halde çalışmaz.
export {};

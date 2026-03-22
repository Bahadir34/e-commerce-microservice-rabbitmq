declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      JWT_SECRET: string;
      RABBITMQ_URL: string;
      MONGODB_URI: string;
      RATE_LIMIT_WINDOW: string;
      RATE_LIMIT_MAX_REQ: string;
    }
  }
}

export {};

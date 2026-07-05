import { registerAs } from "@nestjs/config";

export type AppConfig = ReturnType<typeof appConfig>;

export const appConfig = registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "3002", 10),
  serviceName: process.env.SERVICE_NAME ?? "order-service",
  logLevel: (process.env.LOG_LEVEL ?? "info") as
    | "debug"
    | "info"
    | "warn"
    | "error",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "",
  },
  productService: {
    url: process.env.PRODUCT_SERVICE_URL ?? "",
    internalApiKey: process.env.INTERNAL_API_KEY ?? "",
  },
  corsOrigins: (process.env.CORS_ORIGINS ?? "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  bodyLimit: process.env.BODY_LIMIT ?? "1mb",
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL_MS ?? "60000", 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? "100", 10),
  },
}));

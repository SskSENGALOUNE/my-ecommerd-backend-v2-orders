import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "staging", "production")
    .default("development"),
  PORT: Joi.number().port().default(3002),
  SERVICE_NAME: Joi.string().default("order-service"),
  LOG_LEVEL: Joi.string()
    .valid("debug", "info", "warn", "error")
    .default("info"),

  DATABASE_URL: Joi.string()
    .uri({ scheme: ["postgresql", "postgres"] })
    .required(),

  // Must match auth-service's JWT_ACCESS_SECRET so tokens it mints verify here.
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),

  // product-service base URL (incl. /api/v1) + shared internal key for checkout.
  PRODUCT_SERVICE_URL: Joi.string().uri().required(),
  INTERNAL_API_KEY: Joi.string().min(16).required(),

  CORS_ORIGINS: Joi.string().default("*"),

  THROTTLE_TTL_MS: Joi.number().default(60_000),
  THROTTLE_LIMIT: Joi.number().default(100),

  BODY_LIMIT: Joi.string().default("1mb"),
}).unknown(true);

import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

// Load .env FIRST before any other imports that might read process.env
dotenvConfig({ path: resolve(__dirname, "..", ".env"), override: true });

import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import compression from "compression";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./utilities/interceptor/logger";
import { BaseResponseInterceptor } from "./presentation/interceptors/base-response.interceptor";
import { GlobalExceptionFilter } from "./presentation/filters/global-exception.filter";
import type { AppConfig } from "./config/app.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const appCfg = config.get<AppConfig>("app")!;

  // ───── Security & infrastructure middleware ─────
  app.use(helmet());
  app.use(compression());
  app.use(json({ limit: appCfg.bodyLimit }));
  app.use(urlencoded({ extended: true, limit: appCfg.bodyLimit }));

  app.enableCors({
    origin: appCfg.corsOrigins.includes("*") ? true : appCfg.corsOrigins,
    credentials: true,
  });

  // ───── API surface ─────
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // ───── Cross-cutting interceptors / filters / pipes ─────
  app.useGlobalInterceptors(
    new LoggingInterceptor({ serviceName: appCfg.serviceName }),
    new BaseResponseInterceptor(),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ───── Lifecycle ─────
  app.enableShutdownHooks();

  // ───── Swagger ─────
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Order Service API")
    .setDescription(
      "API documentation for the Order Service — cart, orders and payments (Clean Architecture + CQRS)",
    )
    .setVersion("1.0")
    .addTag("health")
    .addTag("carts")
    .addTag("orders")
    .addTag("payments")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  await app.listen(appCfg.port);

  console.log(
    `Application running on:  http://localhost:${appCfg.port}/api/v1`,
  );
  console.log(`Swagger documentation:   http://localhost:${appCfg.port}/docs`);
}

void bootstrap();

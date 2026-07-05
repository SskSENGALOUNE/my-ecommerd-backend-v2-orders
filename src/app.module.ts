import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";
import { PresentationModule } from "./presentation/presentation.module";
import { ApplicationModule } from "./application/application.module";
import { SharedModule } from "./shared/shared.module";
import { HealthService } from "./utilities/health-check/health.service";
import { DatabaseHealthService } from "./utilities/health-check/database-health.service";
import { envValidationSchema } from "./config/env.validation";
import { appConfig } from "./config/app.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    SharedModule,
    InfrastructureModule,
    ApplicationModule,
    PresentationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    HealthService,
    DatabaseHealthService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './utilities/health-check/health.service';
import { DatabaseHealthService } from './utilities/health-check/database-health.service';
import { DbHealthResult } from './utilities/health-check/db-health-result';

interface HealthResponse {
  status: 'ok' | 'error';
  version: string;
  uptimeSec: number;
  timestamp: string;
  database: DbHealthResult[];
}

@ApiTags('health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class AppController {
  constructor(
    private readonly healthService: HealthService,
    private readonly databaseHealthService: DatabaseHealthService,
  ) {}

  @Get('liveness')
  @Version(VERSION_NEUTRAL)
  @ApiOperation({ summary: 'Liveness probe — process is up' })
  liveness(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('readiness')
  @Version(VERSION_NEUTRAL)
  @ApiOperation({ summary: 'Readiness probe — dependencies are healthy' })
  async readiness(): Promise<HealthResponse> {
    const database = await this.databaseHealthService.checkAll();
    const allOk = database.every((d) => d.status === 'ok');

    return {
      status: allOk ? 'ok' : 'error',
      version: this.healthService.getPackageVersion(),
      uptimeSec: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      database,
    };
  }
}

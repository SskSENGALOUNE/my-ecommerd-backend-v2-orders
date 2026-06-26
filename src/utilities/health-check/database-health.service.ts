import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { DatabaseHealthPort } from './database-health.port';
import { DbHealthResult } from './db-health-result';

@Injectable()
export class DatabaseHealthService implements DatabaseHealthPort {
  constructor(private readonly prisma: PrismaService) {}

  async checkAll(): Promise<DbHealthResult[]> {
    return [await this.checkPrisma()];
  }

  private async checkPrisma(): Promise<DbHealthResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { engine: 'prisma', status: 'ok' };
    } catch (err) {
      return {
        engine: 'prisma',
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }
}

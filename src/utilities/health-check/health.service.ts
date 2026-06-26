import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable()
export class HealthService {
  private cachedVersion: string;

  constructor() {
    this.cachedVersion = this.getPackageVersion();
  }

  public getPackageVersion(): string {
    const defaultVersion = '1.0.0';
    try {
      const packageJson = JSON.parse(
        readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
      ) as Record<string, string>;
      return packageJson.version || defaultVersion;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.warn(
        'Could not read package.json, using default version:',
        errorMessage,
      );
      return defaultVersion;
    }
  }
}

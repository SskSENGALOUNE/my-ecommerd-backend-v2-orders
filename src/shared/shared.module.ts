import { Global, Module } from '@nestjs/common';

/**
 * Global module for cross-cutting providers shared across feature modules.
 * Empty for now — register shared/global providers here as the service grows.
 * Repository bindings live in their feature infrastructure modules.
 */
@Global()
@Module({
  providers: [],
  exports: [],
})
export class SharedModule {}

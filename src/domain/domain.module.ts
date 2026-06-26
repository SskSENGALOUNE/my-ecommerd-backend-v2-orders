import { Module } from '@nestjs/common';

@Module({
  // Domain layer exports repository interfaces, entities, and domain services
  // No providers here - domain is pure business logic with no dependencies
  exports: [],
})
export class DomainModule {}

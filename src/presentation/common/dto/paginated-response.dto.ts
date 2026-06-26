import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() total: number;
  @ApiProperty() totalPages: number;
  @ApiProperty() hasNext: boolean;
  @ApiProperty() hasPrev: boolean;
}

export class PaginatedResponse<T> {
  @ApiProperty({ isArray: true })
  items: T[];

  @ApiProperty({ type: PaginationMeta })
  pagination: PaginationMeta;

  constructor(items: T[], pagination: PaginationMeta) {
    this.items = items;
    this.pagination = pagination;
  }

  static build<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponse<T> {
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
    return new PaginatedResponse<T>(items, {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  }
}

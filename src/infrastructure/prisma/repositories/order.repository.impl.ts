import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import {
  IOrderRepository,
  OrderQueryParams,
  PaginatedResult,
} from '../../../domain/order/order.repository';
import { Order } from '../../../domain/order/order.entity';
import { OrderMapper } from '../mappers/order.mapper';

@Injectable()
export class OrderRepositoryImpl implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: Order): Promise<Order> {
    const model = await this.prisma.order.create({
      data: OrderMapper.toCreateInput(entity),
      include: { items: true },
    });
    return OrderMapper.toDomain(model);
  }

  async findById(id: string): Promise<Order | null> {
    const model = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return model ? OrderMapper.toDomain(model) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const model = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    return model ? OrderMapper.toDomain(model) : null;
  }

  async findPaginated(
    params: OrderQueryParams,
  ): Promise<PaginatedResult<Order>> {
    const where: Prisma.OrderWhereInput = params.customerId
      ? { customerId: params.customerId }
      : {};
    const orderBy = {
      [params.sortBy ?? 'createdAt']: params.sortOrder ?? 'desc',
    };

    const [models, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy,
        include: { items: true },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items: models.map(OrderMapper.toDomain), total };
  }

  async save(entity: Order): Promise<Order> {
    const model = await this.prisma.order.update({
      where: { id: entity.id },
      data: OrderMapper.toUpdateInput(entity),
      include: { items: true },
    });
    return OrderMapper.toDomain(model);
  }
}

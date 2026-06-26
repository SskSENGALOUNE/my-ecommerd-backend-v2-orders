export interface CreateOrderItemInput {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export class CreateOrderCommand {
  constructor(
    public readonly customerId: string,
    public readonly shippingAddress: string,
    public readonly items: CreateOrderItemInput[],
    public readonly createdBy: string,
  ) {}
}

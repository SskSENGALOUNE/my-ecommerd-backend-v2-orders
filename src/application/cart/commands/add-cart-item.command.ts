export class AddCartItemCommand {
  constructor(
    public readonly customerId: string,
    public readonly productId: string,
    public readonly unitPrice: number,
    public readonly quantity: number,
  ) {}
}

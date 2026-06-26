export class RemoveCartItemCommand {
  constructor(
    public readonly customerId: string,
    public readonly productId: string,
  ) {}
}

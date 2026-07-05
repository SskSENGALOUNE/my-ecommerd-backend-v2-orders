export class CheckoutCommand {
  constructor(
    public readonly customerId: string,
    public readonly shippingAddress: string,
  ) {}
}

export class CompletePaymentCommand {
  constructor(
    public readonly orderId: string,
    public readonly transactionRef: string,
    public readonly updatedBy: string,
  ) {}
}

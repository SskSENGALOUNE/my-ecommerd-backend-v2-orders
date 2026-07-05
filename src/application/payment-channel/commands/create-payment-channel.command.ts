export class CreatePaymentChannelCommand {
  constructor(
    public readonly bankName: string,
    public readonly qrImageUrl: string,
    public readonly accountName?: string | null,
    public readonly accountNumber?: string | null,
    public readonly sortOrder?: number,
  ) {}
}

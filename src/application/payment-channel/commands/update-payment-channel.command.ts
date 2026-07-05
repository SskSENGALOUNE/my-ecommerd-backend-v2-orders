export class UpdatePaymentChannelCommand {
  constructor(
    public readonly id: string,
    public readonly bankName?: string,
    public readonly qrImageUrl?: string,
    public readonly accountName?: string | null,
    public readonly accountNumber?: string | null,
    public readonly isActive?: boolean,
    public readonly sortOrder?: number,
  ) {}
}

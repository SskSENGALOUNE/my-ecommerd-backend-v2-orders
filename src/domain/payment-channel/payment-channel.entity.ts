import { randomUUID } from "crypto";
import { DomainValidationException } from "../exceptions";

export interface PaymentChannelProps {
  id: string;
  bankName: string;
  accountName: string | null;
  accountNumber: string | null;
  qrImageUrl: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * An admin-managed payment channel: a bank plus the QR image customers scan to
 * pay. Payments are settled manually (customer attaches a slip, an admin
 * verifies), so a channel carries no gateway credentials — just display data.
 */
export class PaymentChannel {
  private constructor(private readonly props: PaymentChannelProps) {}

  get id(): string {
    return this.props.id;
  }

  get bankName(): string {
    return this.props.bankName;
  }

  get accountName(): string | null {
    return this.props.accountName;
  }

  get accountNumber(): string | null {
    return this.props.accountNumber;
  }

  get qrImageUrl(): string {
    return this.props.qrImageUrl;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get sortOrder(): number {
    return this.props.sortOrder;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(input: {
    bankName: string;
    qrImageUrl: string;
    accountName?: string | null;
    accountNumber?: string | null;
    sortOrder?: number;
  }): PaymentChannel {
    if (!input.bankName?.trim()) {
      throw new DomainValidationException("bankName is required");
    }
    if (!input.qrImageUrl?.trim()) {
      throw new DomainValidationException("qrImageUrl is required");
    }
    const now = new Date();
    return new PaymentChannel({
      id: randomUUID(),
      bankName: input.bankName.trim(),
      accountName: input.accountName?.trim() || null,
      accountNumber: input.accountNumber?.trim() || null,
      qrImageUrl: input.qrImageUrl.trim(),
      isActive: true,
      sortOrder: input.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: PaymentChannelProps): PaymentChannel {
    return new PaymentChannel({ ...props });
  }

  update(input: {
    bankName?: string;
    accountName?: string | null;
    accountNumber?: string | null;
    qrImageUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
  }): void {
    if (input.bankName !== undefined) {
      if (!input.bankName.trim()) {
        throw new DomainValidationException("bankName cannot be empty");
      }
      this.props.bankName = input.bankName.trim();
    }
    if (input.qrImageUrl !== undefined) {
      if (!input.qrImageUrl.trim()) {
        throw new DomainValidationException("qrImageUrl cannot be empty");
      }
      this.props.qrImageUrl = input.qrImageUrl.trim();
    }
    if (input.accountName !== undefined) {
      this.props.accountName = input.accountName?.trim() || null;
    }
    if (input.accountNumber !== undefined) {
      this.props.accountNumber = input.accountNumber?.trim() || null;
    }
    if (input.isActive !== undefined) {
      this.props.isActive = input.isActive;
    }
    if (input.sortOrder !== undefined) {
      this.props.sortOrder = input.sortOrder;
    }
    this.props.updatedAt = new Date();
  }
}

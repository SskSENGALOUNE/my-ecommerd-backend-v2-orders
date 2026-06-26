export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

/** Allowed payment status transitions. */
export const PAYMENT_STATUS_TRANSITIONS: Record<
  PaymentStatus,
  PaymentStatus[]
> = {
  [PaymentStatus.PENDING]: [PaymentStatus.COMPLETED, PaymentStatus.FAILED],
  [PaymentStatus.COMPLETED]: [PaymentStatus.REFUNDED],
  [PaymentStatus.FAILED]: [PaymentStatus.PENDING],
  [PaymentStatus.REFUNDED]: [],
};

import { Payment } from './payment.entity';

/** Domain port for the Payment entity. */
export interface IPaymentRepository {
  create(entity: Payment): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<Payment | null>;
  save(entity: Payment): Promise<Payment>;
}

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

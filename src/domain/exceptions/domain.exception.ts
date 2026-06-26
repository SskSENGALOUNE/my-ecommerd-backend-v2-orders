export enum DomainErrorCode {
  VALIDATION = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
}

export abstract class DomainException extends Error {
  abstract readonly code: DomainErrorCode;
  abstract readonly httpStatus: number;

  readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = new.target.name;
    this.details = details;
    Error.captureStackTrace?.(this, new.target);
  }
}

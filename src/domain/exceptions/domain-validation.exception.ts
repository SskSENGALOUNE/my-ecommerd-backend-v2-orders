import { DomainErrorCode, DomainException } from './domain.exception';

export class DomainValidationException extends DomainException {
  readonly code = DomainErrorCode.VALIDATION;
  readonly httpStatus = 400;
}

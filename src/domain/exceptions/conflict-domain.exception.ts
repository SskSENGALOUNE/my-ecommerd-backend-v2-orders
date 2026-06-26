import { DomainErrorCode, DomainException } from './domain.exception';

export class ConflictDomainException extends DomainException {
  readonly code = DomainErrorCode.CONFLICT;
  readonly httpStatus = 409;
}

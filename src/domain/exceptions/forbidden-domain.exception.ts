import { DomainErrorCode, DomainException } from './domain.exception';

export class ForbiddenDomainException extends DomainException {
  readonly code = DomainErrorCode.FORBIDDEN;
  readonly httpStatus = 403;
}

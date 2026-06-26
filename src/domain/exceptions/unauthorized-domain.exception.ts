import { DomainErrorCode, DomainException } from './domain.exception';

export class UnauthorizedDomainException extends DomainException {
  readonly code = DomainErrorCode.UNAUTHORIZED;
  readonly httpStatus = 401;
}

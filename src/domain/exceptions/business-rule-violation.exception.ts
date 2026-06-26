import { DomainErrorCode, DomainException } from './domain.exception';

export class BusinessRuleViolationException extends DomainException {
  readonly code = DomainErrorCode.BUSINESS_RULE_VIOLATION;
  readonly httpStatus = 422;
}

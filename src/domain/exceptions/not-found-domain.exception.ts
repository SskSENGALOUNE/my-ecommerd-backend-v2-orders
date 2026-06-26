import { DomainErrorCode, DomainException } from './domain.exception';

export class NotFoundDomainException extends DomainException {
  readonly code = DomainErrorCode.NOT_FOUND;
  readonly httpStatus = 404;

  static forResource(resource: string, id: string | number): NotFoundDomainException {
    return new NotFoundDomainException(`${resource} with id ${id} not found`, {
      resource,
      id,
    });
  }
}

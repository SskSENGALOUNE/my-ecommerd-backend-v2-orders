import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { BaseResponse } from '../common/responses/base.response';

@Injectable()
export class BaseResponseInterceptor<T>
  implements NestInterceptor<T, BaseResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<BaseResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Prevent double wrap
        if (data instanceof BaseResponse) {
          return data;
        }

        return BaseResponse.ok(data);
      }),
    );
  }
}

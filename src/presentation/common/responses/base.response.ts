import { ApiProperty } from '@nestjs/swagger';

export interface BaseResponseError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface BaseResponseMeta {
  traceId?: string;
  timestamp?: string;
  path?: string;
}

export class BaseResponse<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false })
  error?: BaseResponseError;

  @ApiProperty({ required: false })
  meta?: BaseResponseMeta;

  constructor(partial: Partial<BaseResponse<T>>) {
    Object.assign(this, partial);
  }

  static ok<T>(data: T): BaseResponse<T> {
    return new BaseResponse<T>({
      success: true,
      data,
    });
  }

  static error(
    code: string,
    message: string,
    options?: { details?: Record<string, unknown>; meta?: BaseResponseMeta },
  ): BaseResponse<null> {
    return new BaseResponse<null>({
      success: false,
      error: { code, message, details: options?.details },
      meta: options?.meta,
    });
  }
}

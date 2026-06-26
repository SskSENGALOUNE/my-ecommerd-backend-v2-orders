import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { DomainException } from '../../domain/exceptions';
import { BaseResponse, BaseResponseError } from '../common/responses/base.response';
import { iquriLogger } from '../../utilities/interceptor/logger';

interface TracedRequest extends Request {
  traceId?: string;
  serviceName?: string;
}

interface NormalizedError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly fallbackLogger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<TracedRequest>();
    const response = ctx.getResponse<Response>();

    const traceId =
      request.traceId ||
      (request.headers['x-trace-id'] as string | undefined) ||
      'unknown';
    const serviceName = request.serviceName || 'iquri-unknown-service';

    const normalized = this.normalize(exception);

    const body = BaseResponse.error(normalized.code, normalized.message, {
      details: normalized.details,
      meta: {
        traceId,
        timestamp: new Date().toISOString(),
        path: request.originalUrl || request.url,
      },
    });

    this.log(normalized, exception, request, traceId, serviceName);

    response.status(normalized.status).json(body);
  }

  private normalize(exception: unknown): NormalizedError {
    if (exception instanceof DomainException) {
      return {
        status: exception.httpStatus,
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaKnownError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        code: 'PRISMA_VALIDATION_ERROR',
        message: 'Invalid query payload',
      };
    }

    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_SERVER_ERROR',
        message: exception.message || 'Unexpected error',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected error',
    };
  }

  private fromHttpException(exception: HttpException): NormalizedError {
    const status = exception.getStatus();
    const raw = exception.getResponse();

    if (typeof raw === 'string') {
      return { status, code: this.codeFromStatus(status), message: raw };
    }

    const obj = raw as Record<string, unknown>;
    const messageValue = obj.message;
    const message = Array.isArray(messageValue)
      ? messageValue.join('; ')
      : (messageValue as string | undefined) || exception.message;

    const code =
      (obj.error as string | undefined)?.toUpperCase().replace(/\s+/g, '_') ||
      this.codeFromStatus(status);

    const details = Array.isArray(messageValue)
      ? { errors: messageValue }
      : undefined;

    return { status, code, message, details };
  }

  private fromPrismaKnownError(
    err: Prisma.PrismaClientKnownRequestError,
  ): NormalizedError {
    const target = (err.meta?.target as string[] | string | undefined) ?? null;

    switch (err.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          code: 'CONFLICT',
          message: 'Unique constraint violation',
          details: { target },
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          code: 'NOT_FOUND',
          message: (err.meta?.cause as string) || 'Record not found',
        };
      case 'P2003':
        return {
          status: HttpStatus.CONFLICT,
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'Foreign key constraint failed',
          details: { field: err.meta?.field_name },
        };
      case 'P2000':
        return {
          status: HttpStatus.BAD_REQUEST,
          code: 'VALUE_TOO_LONG',
          message: 'Value too long for column',
          details: { column: err.meta?.column_name },
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          code: `PRISMA_${err.code}`,
          message: 'Database error',
        };
    }
  }

  private codeFromStatus(status: number): string {
    return HttpStatus[status] ?? 'ERROR';
  }

  private log(
    normalized: NormalizedError,
    exception: unknown,
    request: TracedRequest,
    traceId: string,
    serviceName: string,
  ): void {
    const stack = exception instanceof Error ? exception.stack : undefined;

    const entry = {
      message: `[Exception] ${normalized.message}`,
      traceId,
      serviceName,
      statusCode: normalized.status,
      code: normalized.code,
      method: request.method,
      url: request.originalUrl || request.url,
      stack,
      context: 'GlobalExceptionFilter',
    };

    try {
      if (normalized.status >= 500) {
        iquriLogger.error(entry);
      } else {
        iquriLogger.warn(entry);
      }
    } catch {
      this.fallbackLogger.error(JSON.stringify({ ...entry, stack: undefined }));
    }
  }
}

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { iquriLogger } from './logger';
import { TracedRequest, HttpExceptionResponse } from './interfaces';

@Catch()
export class IquriExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<TracedRequest>();
    const response = ctx.getResponse<Response>();

    // Get traceId and serviceName from request (attached by Interceptor)
    const traceId = request.traceId || (request.headers['x-trace-id'] as string) || 'unknown';
    const serviceName = request.serviceName || 'iquri-unknown-service';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        const responseObj = exceptionResponse as HttpExceptionResponse;
        message = responseObj.message || exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }

    // Log the exception with full context
    iquriLogger.error({
      message: `[Exception] ${message}`,
      traceId,
      serviceName,
      statusCode: status,
      method: request.method,
      url: request.originalUrl || request.url,
      stack,
      context: 'ExceptionFilter',
    });

    // Send response
    response.status(status).json({
      statusCode: status,
      message,
      traceId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

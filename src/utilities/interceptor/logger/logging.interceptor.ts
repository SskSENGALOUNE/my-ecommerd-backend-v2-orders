import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
// import { v4 as uuidv4 } from 'uuid';
import { iquriLogger, enableConsoleHijacking } from './logger';
import { als } from './utils/als';
import type { LoggerOptions } from './interfaces';
import { TracedRequest, RequestContext } from './interfaces';
import { Response } from 'express';
const { v4: uuidv4 } = require('uuid'); 

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private options: Required<LoggerOptions>;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      serviceName:
        options.serviceName ||
        process.env['SERVICE_NAME'] ||
        'iquri-unknown-service',
      enableAccessLog:
        options.enableAccessLog !== undefined ? options.enableAccessLog : true,
      enableConsoleHijacking:
        options.enableConsoleHijacking !== undefined
          ? options.enableConsoleHijacking
          : true,
      skipPaths: options.skipPaths || [],
      logLevel: options.logLevel || 'info',
    };

    // Set log level dynamically
    iquriLogger.level = this.options.logLevel;

    // Enable console hijacking if requested (default: true)
    if (this.options.enableConsoleHijacking) {
      enableConsoleHijacking();
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<TracedRequest>();
    const res = ctx.getResponse<Response>();

    const method = req.method;
    const url = req.originalUrl || req.url;

    // Check Skip Paths
    if (this.options.skipPaths.some((path) => url.includes(path))) {
      return next.handle();
    }

    const startTime = Date.now();

    // Trace ID Management
    const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
    req.headers['x-trace-id'] = traceId;

    // Set Trace ID in Response Header for client debugging
    res.setHeader('x-trace-id', traceId);

    // Attach traceId to request for use by ExceptionFilter
    req.traceId = traceId;
    req.serviceName = this.options.serviceName;

    return new Observable((observer) => {
      const store = new Map<keyof RequestContext, string>();
      store.set('traceId', traceId);
      store.set('serviceName', this.options.serviceName);

      als.run(store, () => {
        next
          .handle()
          .pipe(
            tap(() => {
              if (this.options.enableAccessLog) {
                const statusCode = res.statusCode || 200;
                const ip = req.ip || req.socket?.remoteAddress || '';
                const userAgent = req.headers['user-agent'] || '';
                const duration = Date.now() - startTime;

                iquriLogger.info({
                  message: `[${method}] ${url}`,
                  traceId,
                  statusCode,
                  durationMs: duration,
                  method,
                  url,
                  ip,
                  userAgent,
                  serviceName: this.options.serviceName,
                });
              }
            }),
            catchError((err: Error) => {
              let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
              if (err instanceof HttpException) {
                statusCode = err.getStatus();
              }

              const duration = Date.now() - startTime;

              const errorLog = {
                message: `[${method}] ${url}`,
                traceId,
                statusCode,
                durationMs: duration,
                method,
                url,
                ip: req.ip || req.socket?.remoteAddress || '',
                error: err ? err.message : undefined,
                serviceName: this.options.serviceName,
              };

              if (statusCode >= 500) {
                iquriLogger.error(errorLog);
              } else {
                iquriLogger.warn(errorLog);
              }
              return throwError(() => err);
            }),
          )
          .subscribe(observer);
      });
    });
  }
}

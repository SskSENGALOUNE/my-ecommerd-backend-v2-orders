import { LoggerService } from '@nestjs/common';
import { iquriLogger } from './logger';
import { getTraceId, getServiceName } from './utils/als';

interface FormattedMessage {
  message: string;
  context?: string;
  traceId?: string;
  serviceName?: string;
  stack?: string;
}

export class IquriNestLogger implements LoggerService {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private formatMessage(message: unknown, context?: string): FormattedMessage {
    const traceId = getTraceId();
    const serviceName = getServiceName();

    return {
      message: typeof message === 'object' ? JSON.stringify(message) : String(message),
      context: context || this.context,
      ...(traceId ? { traceId } : {}),
      ...(serviceName ? { serviceName } : {}),
    };
  }

  log(message: unknown, context?: string): void {
    iquriLogger.info(this.formatMessage(message, context));
  }

  error(message: unknown, trace?: string, context?: string): void {
    const logObj: FormattedMessage = this.formatMessage(message, context);
    if (trace) {
      logObj.stack = trace;
    }
    iquriLogger.error(logObj);
  }

  warn(message: unknown, context?: string): void {
    iquriLogger.warn(this.formatMessage(message, context));
  }

  debug(message: unknown, context?: string): void {
    iquriLogger.debug(this.formatMessage(message, context));
  }

  verbose(message: unknown, context?: string): void {
    iquriLogger.verbose(this.formatMessage(message, context));
  }

  /**
   * Set context for this logger instance
   */
  setContext(context: string): void {
    this.context = context;
  }
}

// Export singleton instance for convenience
export const nestLogger = new IquriNestLogger();

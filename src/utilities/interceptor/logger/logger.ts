import * as winston from 'winston';
import { getTraceId, getServiceName } from './utils/als';
import { SerializedError, LogObject } from './interfaces';

// Winston log info type
interface WinstonLogInfo {
  timestamp?: string;
  level: string;
  service?: string;
  traceId?: string;
  message: string;
  context?: string;
  serviceName?: string;
  [key: string]: unknown;
}

// Original console methods storage
interface OriginalConsoleMethods {
  log: typeof console.log;
  info: typeof console.info;
  warn: typeof console.warn;
  error: typeof console.error;
  debug: typeof console.debug;
}

let originalConsole: OriginalConsoleMethods | null = null;
let isHijackingEnabled = false;

// Custom JSON Format with ordered keys
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const logInfo = info as WinstonLogInfo;
    const { timestamp, level, service, traceId, message, context, serviceName, ...others } =
      logInfo;

    const orderedLog = {
      timestamp,
      level,
      service: serviceName || service || 'iquri-unknown-service',
      traceId,
      context,
      message,
      ...others,
    };

    return JSON.stringify(orderedLog);
  }),
);

// Create Logger Instance
export const iquriLogger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: logFormat,
  defaultMeta: { service: process.env['SERVICE_NAME'] || 'iquri-unknown-service' },
  transports: [new winston.transports.Console()],
});

// === Console Hijacking ===

// Helper: Serialize Error objects properly
const serializeArg = (arg: unknown): unknown => {
  if (arg instanceof Error) {
    const serialized: SerializedError = {
      name: arg.name,
      message: arg.message,
      stack: arg.stack,
    };
    return serialized;
  }
  return arg;
};

const enhancedLog = (level: string, message: unknown, ...args: unknown[]): void => {
  const traceId = getTraceId();
  const serviceName = getServiceName();

  const context = {
    ...(traceId ? { traceId } : {}),
    ...(serviceName ? { serviceName } : {}),
  };

  // Handle message if it's an Error
  let logObject: LogObject;
  if (message instanceof Error) {
    logObject = {
      message: message.message,
      error: serializeArg(message) as SerializedError,
      ...context,
    };
  } else if (typeof message === 'object' && message !== null) {
    logObject = { ...(message as Record<string, unknown>), ...context };
  } else {
    logObject = { message: String(message), ...context };
  }

  // Process args - serialize Errors properly
  if (args.length > 0) {
    const serializedArgs = args.map(serializeArg);
    // If there's only one arg and it's an error, put it in 'error' field
    if (args.length === 1 && args[0] instanceof Error) {
      logObject.error = serializedArgs[0] as SerializedError;
    } else {
      logObject.args = serializedArgs;
    }
  }

  iquriLogger.log(level, logObject);
};

/**
 * Enable console hijacking - converts console.log/info/warn/error/debug
 * to structured JSON logs with traceId and serviceName.
 *
 * @example
 * ```typescript
 * import { enableConsoleHijacking } from '@iquri/logger-interceptor';
 *
 * // In your main.ts or bootstrap
 * enableConsoleHijacking();
 *
 * // Now console.log outputs JSON
 * console.log('Hello'); // {"timestamp":"...","level":"info","message":"Hello",...}
 * ```
 */
export function enableConsoleHijacking(): void {
  if (isHijackingEnabled) {
    return; // Already enabled
  }

  // Store original methods
  originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };

  // Override console methods
  console.log = (message?: unknown, ...args: unknown[]): void =>
    enhancedLog('info', message, ...args);
  console.info = (message?: unknown, ...args: unknown[]): void =>
    enhancedLog('info', message, ...args);
  console.warn = (message?: unknown, ...args: unknown[]): void =>
    enhancedLog('warn', message, ...args);
  console.error = (message?: unknown, ...args: unknown[]): void =>
    enhancedLog('error', message, ...args);
  console.debug = (message?: unknown, ...args: unknown[]): void =>
    enhancedLog('debug', message, ...args);

  isHijackingEnabled = true;
}

/**
 * Disable console hijacking - restores original console methods.
 *
 * @example
 * ```typescript
 * import { disableConsoleHijacking } from '@iquri/logger-interceptor';
 *
 * // Restore original console behavior
 * disableConsoleHijacking();
 *
 * // Now console.log works normally again
 * console.log('Hello'); // Hello
 * ```
 */
export function disableConsoleHijacking(): void {
  if (!isHijackingEnabled || !originalConsole) {
    return; // Not enabled or no original to restore
  }

  // Restore original methods
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;

  originalConsole = null;
  isHijackingEnabled = false;
}

/**
 * Check if console hijacking is currently enabled.
 *
 * @returns true if hijacking is enabled, false otherwise
 */
export function isConsoleHijacked(): boolean {
  return isHijackingEnabled;
}

/**
 * Get the original console methods (useful for debugging the logger itself).
 * Returns null if hijacking is not enabled.
 *
 * @returns Original console methods or null
 */
export function getOriginalConsole(): OriginalConsoleMethods | null {
  return originalConsole;
}

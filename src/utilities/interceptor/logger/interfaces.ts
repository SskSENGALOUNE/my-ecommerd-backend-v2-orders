export interface LoggerOptions {
  serviceName?: string;
  enableAccessLog?: boolean;
  enableConsoleHijacking?: boolean;
  skipPaths?: string[];
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

// Extended Request with traceId and serviceName
// Using declaration merging with express Request
export interface TracedRequest {
  traceId?: string;
  serviceName?: string;
  method: string;
  originalUrl: string;
  url: string;
  ip?: string;
  socket?: { remoteAddress?: string };
  headers: Record<string, string | string[] | undefined> & {
    'x-trace-id'?: string;
    'user-agent'?: string;
  };
}

// Store type for AsyncLocalStorage
export interface RequestContext {
  traceId: string;
  serviceName: string;
}

// Serialized error object
export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
}

// Log object structure
export interface LogObject {
  message?: string;
  traceId?: string;
  serviceName?: string;
  error?: SerializedError;
  args?: unknown[];
  [key: string]: unknown;
}

// HTTP Exception response type
export interface HttpExceptionResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

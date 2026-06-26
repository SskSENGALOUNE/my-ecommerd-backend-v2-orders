import { ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';
import { iquriLogger, disableConsoleHijacking, isConsoleHijacked } from './logger';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: Partial<ExecutionContext>;
  let mockCallHandler: Partial<CallHandler>;
  let mockRequest: Record<string, unknown>;
  let mockResponse: Record<string, unknown>;

  beforeEach(() => {
    // Ensure console hijacking is disabled before each test
    disableConsoleHijacking();

    mockRequest = {
      method: 'GET',
      originalUrl: '/api/test',
      url: '/api/test',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'test-agent',
      },
      socket: {
        remoteAddress: '127.0.0.1',
      },
    };

    mockResponse = {
      statusCode: 200,
      setHeader: jest.fn(),
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    };

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ data: 'test' })),
    };
  });

  afterEach(() => {
    disableConsoleHijacking();
  });

  describe('constructor', () => {
    it('should create with default options', () => {
      interceptor = new LoggingInterceptor();
      expect(interceptor).toBeDefined();
    });

    it('should create with custom serviceName', () => {
      interceptor = new LoggingInterceptor({
        serviceName: 'custom-service',
        enableConsoleHijacking: false,
      });
      expect(interceptor).toBeDefined();
    });

    it('should enable console hijacking by default', () => {
      interceptor = new LoggingInterceptor();
      expect(isConsoleHijacked()).toBe(true);
      disableConsoleHijacking();
    });

    it('should not enable console hijacking when disabled', () => {
      interceptor = new LoggingInterceptor({
        enableConsoleHijacking: false,
      });
      expect(isConsoleHijacked()).toBe(false);
    });

    it('should set log level', () => {
      interceptor = new LoggingInterceptor({
        logLevel: 'debug',
        enableConsoleHijacking: false,
      });
      expect(iquriLogger.level).toBe('debug');
    });
  });

  describe('intercept', () => {
    beforeEach(() => {
      interceptor = new LoggingInterceptor({
        serviceName: 'test-service',
        enableConsoleHijacking: false,
      });
    });

    it('should return observable', (done) => {
      const result = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      expect(result).toBeDefined();
      result.subscribe({
        next: (value) => {
          expect(value).toEqual({ data: 'test' });
        },
        complete: () => done(),
      });
    });

    it('should generate traceId if not provided', (done) => {
      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          complete: () => {
            expect(mockRequest['traceId']).toBeDefined();
            expect(typeof mockRequest['traceId']).toBe('string');
            done();
          },
        });
    });

    it('should use existing traceId from headers', (done) => {
      mockRequest['headers'] = {
        'x-trace-id': 'existing-trace-id',
        'user-agent': 'test-agent',
      };

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          complete: () => {
            expect(mockRequest['traceId']).toBe('existing-trace-id');
            done();
          },
        });
    });

    it('should set traceId in response header', (done) => {
      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          complete: () => {
            expect(mockResponse['setHeader']).toHaveBeenCalledWith(
              'x-trace-id',
              expect.any(String),
            );
            done();
          },
        });
    });

    it('should set serviceName on request', (done) => {
      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          complete: () => {
            expect(mockRequest['serviceName']).toBe('test-service');
            done();
          },
        });
    });

    it('should log access when enabled', (done) => {
      const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          complete: () => {
            expect(infoSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                method: 'GET',
                url: '/api/test',
                statusCode: 200,
              }),
            );
            done();
          },
        });
    });

    it('should not log when access log disabled', (done) => {
      interceptor = new LoggingInterceptor({
        enableAccessLog: false,
        enableConsoleHijacking: false,
      });
      const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          complete: () => {
            expect(infoSpy).not.toHaveBeenCalled();
            done();
          },
        });
    });

    it('should skip logging for skipPaths', (done) => {
      interceptor = new LoggingInterceptor({
        skipPaths: ['/health', '/api/test'],
        enableConsoleHijacking: false,
      });
      const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          complete: () => {
            expect(infoSpy).not.toHaveBeenCalled();
            done();
          },
        });
    });

    it('should include duration in log', (done) => {
      const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          complete: () => {
            expect(infoSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                durationMs: expect.any(Number),
              }),
            );
            done();
          },
        });
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      interceptor = new LoggingInterceptor({
        serviceName: 'test-service',
        enableConsoleHijacking: false,
      });
    });

    it('should log error for 5xx status', (done) => {
      const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();
      mockCallHandler.handle = jest
        .fn()
        .mockReturnValue(throwError(() => new Error('Internal error')));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          error: () => {
            expect(errorSpy).toHaveBeenCalled();
            done();
          },
        });
    });

    it('should log warning for 4xx status', (done) => {
      const warnSpy = jest.spyOn(iquriLogger, 'warn').mockImplementation();
      mockCallHandler.handle = jest
        .fn()
        .mockReturnValue(throwError(() => new HttpException('Not Found', HttpStatus.NOT_FOUND)));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          error: () => {
            expect(warnSpy).toHaveBeenCalled();
            done();
          },
        });
    });

    it('should include error message in log', (done) => {
      const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();
      mockCallHandler.handle = jest
        .fn()
        .mockReturnValue(throwError(() => new Error('Test error message')));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          error: () => {
            expect(errorSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                error: 'Test error message',
              }),
            );
            done();
          },
        });
    });

    it('should rethrow the error', (done) => {
      jest.spyOn(iquriLogger, 'error').mockImplementation();
      const testError = new Error('Test error');
      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => testError));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          error: (err) => {
            expect(err).toBe(testError);
            done();
          },
        });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      interceptor = new LoggingInterceptor({
        serviceName: 'test-service',
        enableConsoleHijacking: false,
      });
    });

    it('should fallback to url when originalUrl is not set', (done) => {
      mockRequest['originalUrl'] = undefined;
      mockRequest['url'] = '/fallback-url';
      const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          complete: () => {
            expect(infoSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                url: '/fallback-url',
              }),
            );
            done();
          },
        });
    });

    it('should fallback to socket.remoteAddress when ip is not set', (done) => {
      mockRequest['ip'] = undefined;
      mockRequest['socket'] = { remoteAddress: '192.168.1.1' };
      const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          complete: () => {
            expect(infoSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                ip: '192.168.1.1',
              }),
            );
            done();
          },
        });
    });

    it('should fallback to empty string when no ip or socket', (done) => {
      mockRequest['ip'] = undefined;
      mockRequest['socket'] = undefined;
      const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          complete: () => {
            expect(infoSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                ip: '',
              }),
            );
            done();
          },
        });
    });

    it('should fallback to empty string when socket has no remoteAddress', (done) => {
      mockRequest['ip'] = undefined;
      mockRequest['socket'] = {};
      const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          complete: () => {
            expect(infoSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                ip: '',
              }),
            );
            done();
          },
        });
    });

    it('should fallback to empty string when user-agent header is not set', (done) => {
      mockRequest['headers'] = {};
      const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          complete: () => {
            expect(infoSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                userAgent: '',
              }),
            );
            done();
          },
        });
    });

    it('should fallback to 200 when statusCode is not set', (done) => {
      mockResponse['statusCode'] = undefined;
      const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          complete: () => {
            expect(infoSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                statusCode: 200,
              }),
            );
            done();
          },
        });
    });

    it('should handle ip fallback in error case', (done) => {
      mockRequest['ip'] = undefined;
      mockRequest['socket'] = { remoteAddress: '10.0.0.1' };
      const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();
      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => new Error('test')));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          error: () => {
            expect(errorSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                ip: '10.0.0.1',
              }),
            );
            done();
          },
        });
    });

    it('should handle empty ip and socket in error case', (done) => {
      mockRequest['ip'] = undefined;
      mockRequest['socket'] = undefined;
      const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();
      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => new Error('test')));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe({
          error: () => {
            expect(errorSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                ip: '',
              }),
            );
            done();
          },
        });
    });
  });
});

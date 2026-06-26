import {
  enableConsoleHijacking,
  disableConsoleHijacking,
  isConsoleHijacked,
  getOriginalConsole,
  iquriLogger,
} from './logger';

describe('Logger', () => {
  // Store original console methods before any test
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalDebug = console.debug;

  beforeEach(() => {
    // Ensure we start with hijacking disabled
    disableConsoleHijacking();
  });

  afterEach(() => {
    // Restore original console after each test
    disableConsoleHijacking();
    console.log = originalLog;
    console.info = originalInfo;
    console.warn = originalWarn;
    console.error = originalError;
    console.debug = originalDebug;
  });

  describe('Console Hijacking', () => {
    describe('enableConsoleHijacking', () => {
      it('should enable console hijacking', () => {
        expect(isConsoleHijacked()).toBe(false);

        enableConsoleHijacking();

        expect(isConsoleHijacked()).toBe(true);
      });

      it('should not enable twice if already enabled', () => {
        enableConsoleHijacking();
        const firstOriginal = getOriginalConsole();

        enableConsoleHijacking(); // Call again
        const secondOriginal = getOriginalConsole();

        expect(firstOriginal).toBe(secondOriginal);
      });

      it('should override console.log', () => {
        const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();

        enableConsoleHijacking();
        console.log('test message');

        expect(logSpy).toHaveBeenCalledWith(
          'info',
          expect.objectContaining({ message: 'test message' }),
        );
      });

      it('should override console.info', () => {
        const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();

        enableConsoleHijacking();
        console.info('info message');

        expect(logSpy).toHaveBeenCalledWith(
          'info',
          expect.objectContaining({ message: 'info message' }),
        );
      });

      it('should override console.warn', () => {
        const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();

        enableConsoleHijacking();
        console.warn('warning message');

        expect(logSpy).toHaveBeenCalledWith(
          'warn',
          expect.objectContaining({ message: 'warning message' }),
        );
      });

      it('should override console.error', () => {
        const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();

        enableConsoleHijacking();
        console.error('error message');

        expect(logSpy).toHaveBeenCalledWith(
          'error',
          expect.objectContaining({ message: 'error message' }),
        );
      });

      it('should override console.debug', () => {
        const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();

        enableConsoleHijacking();
        console.debug('debug message');

        expect(logSpy).toHaveBeenCalledWith(
          'debug',
          expect.objectContaining({ message: 'debug message' }),
        );
      });
    });

    describe('disableConsoleHijacking', () => {
      it('should disable console hijacking', () => {
        enableConsoleHijacking();
        expect(isConsoleHijacked()).toBe(true);

        disableConsoleHijacking();

        expect(isConsoleHijacked()).toBe(false);
      });

      it('should restore original console methods', () => {
        const originalLogRef = console.log;

        enableConsoleHijacking();
        expect(console.log).not.toBe(originalLogRef);

        disableConsoleHijacking();
        // After restore, console should work normally (not throw)
        expect(() => console.log('test')).not.toThrow();
      });

      it('should do nothing if not enabled', () => {
        expect(isConsoleHijacked()).toBe(false);
        expect(() => disableConsoleHijacking()).not.toThrow();
        expect(isConsoleHijacked()).toBe(false);
      });
    });

    describe('isConsoleHijacked', () => {
      it('should return false by default', () => {
        expect(isConsoleHijacked()).toBe(false);
      });

      it('should return true after enabling', () => {
        enableConsoleHijacking();
        expect(isConsoleHijacked()).toBe(true);
      });

      it('should return false after disabling', () => {
        enableConsoleHijacking();
        disableConsoleHijacking();
        expect(isConsoleHijacked()).toBe(false);
      });
    });

    describe('getOriginalConsole', () => {
      it('should return null when not hijacked', () => {
        expect(getOriginalConsole()).toBeNull();
      });

      it('should return original methods when hijacked', () => {
        enableConsoleHijacking();
        const original = getOriginalConsole();

        expect(original).not.toBeNull();
        expect(original?.log).toBeDefined();
        expect(original?.info).toBeDefined();
        expect(original?.warn).toBeDefined();
        expect(original?.error).toBeDefined();
        expect(original?.debug).toBeDefined();
      });
    });
  });

  describe('Enhanced Log', () => {
    it('should handle Error objects correctly', () => {
      const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();
      const testError = new Error('Test error');

      enableConsoleHijacking();
      console.error(testError);

      expect(logSpy).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          message: 'Test error',
          error: expect.objectContaining({
            name: 'Error',
            message: 'Test error',
          }),
        }),
      );
    });

    it('should handle object messages', () => {
      const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();

      enableConsoleHijacking();
      console.log({ userId: 123, action: 'login' });

      expect(logSpy).toHaveBeenCalledWith(
        'info',
        expect.objectContaining({
          userId: 123,
          action: 'login',
        }),
      );
    });

    it('should handle additional arguments', () => {
      const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();

      enableConsoleHijacking();
      console.log('message', 'arg1', 'arg2');

      expect(logSpy).toHaveBeenCalledWith(
        'info',
        expect.objectContaining({
          message: 'message',
          args: ['arg1', 'arg2'],
        }),
      );
    });

    it('should serialize Error in arguments', () => {
      const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();
      const testError = new Error('Arg error');

      enableConsoleHijacking();
      console.log('message', testError);

      expect(logSpy).toHaveBeenCalledWith(
        'info',
        expect.objectContaining({
          message: 'message',
          error: expect.objectContaining({
            name: 'Error',
            message: 'Arg error',
          }),
        }),
      );
    });
  });

  describe('iquriLogger', () => {
    it('should be a winston logger instance', () => {
      expect(iquriLogger).toBeDefined();
      expect(iquriLogger.info).toBeDefined();
      expect(iquriLogger.error).toBeDefined();
      expect(iquriLogger.warn).toBeDefined();
      expect(iquriLogger.debug).toBeDefined();
    });

    it('should have default log level', () => {
      expect(iquriLogger.level).toBe('info');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null message', () => {
      const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();

      enableConsoleHijacking();
      console.log(null);

      expect(logSpy).toHaveBeenCalledWith('info', expect.objectContaining({ message: 'null' }));
    });

    it('should handle undefined message', () => {
      const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();

      enableConsoleHijacking();
      console.log(undefined);

      expect(logSpy).toHaveBeenCalledWith(
        'info',
        expect.objectContaining({ message: 'undefined' }),
      );
    });

    it('should handle number message', () => {
      const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();

      enableConsoleHijacking();
      console.log(12345);

      expect(logSpy).toHaveBeenCalledWith('info', expect.objectContaining({ message: '12345' }));
    });

    it('should handle boolean message', () => {
      const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();

      enableConsoleHijacking();
      console.log(true);

      expect(logSpy).toHaveBeenCalledWith('info', expect.objectContaining({ message: 'true' }));
    });

    it('should handle multiple Error arguments', () => {
      const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      enableConsoleHijacking();
      console.log('message', error1, error2);

      expect(logSpy).toHaveBeenCalledWith(
        'info',
        expect.objectContaining({
          message: 'message',
          args: expect.arrayContaining([
            expect.objectContaining({ message: 'Error 1' }),
            expect.objectContaining({ message: 'Error 2' }),
          ]),
        }),
      );
    });

    it('should handle empty object message', () => {
      const logSpy = jest.spyOn(iquriLogger, 'log').mockImplementation();

      enableConsoleHijacking();
      console.log({});

      expect(logSpy).toHaveBeenCalledWith('info', expect.any(Object));
    });
  });
});

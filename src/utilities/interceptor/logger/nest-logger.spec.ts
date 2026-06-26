import { IquriNestLogger, nestLogger } from './nest-logger';
import { iquriLogger } from './logger';

describe('NestLogger', () => {
  describe('IquriNestLogger', () => {
    let logger: IquriNestLogger;

    beforeEach(() => {
      logger = new IquriNestLogger();
    });

    describe('constructor', () => {
      it('should create instance without context', () => {
        const instance = new IquriNestLogger();
        expect(instance).toBeDefined();
      });

      it('should create instance with context', () => {
        const instance = new IquriNestLogger('TestContext');
        expect(instance).toBeDefined();
      });
    });

    describe('log', () => {
      it('should call iquriLogger.info', () => {
        const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

        logger.log('test message');

        expect(infoSpy).toHaveBeenCalledWith(expect.objectContaining({ message: 'test message' }));
      });

      it('should include context when provided', () => {
        const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

        logger.log('test message', 'MyContext');

        expect(infoSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'test message',
            context: 'MyContext',
          }),
        );
      });

      it('should use constructor context if method context not provided', () => {
        const contextLogger = new IquriNestLogger('DefaultContext');
        const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

        contextLogger.log('test message');

        expect(infoSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            context: 'DefaultContext',
          }),
        );
      });

      it('should stringify object messages', () => {
        const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

        logger.log({ key: 'value' });

        expect(infoSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            message: '{"key":"value"}',
          }),
        );
      });
    });

    describe('error', () => {
      it('should call iquriLogger.error', () => {
        const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();

        logger.error('error message');

        expect(errorSpy).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'error message' }),
        );
      });

      it('should include stack trace when provided', () => {
        const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();
        const stackTrace = 'Error: test\n    at TestFunction';

        logger.error('error message', stackTrace);

        expect(errorSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'error message',
            stack: stackTrace,
          }),
        );
      });

      it('should include context when provided', () => {
        const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();

        logger.error('error message', undefined, 'ErrorContext');

        expect(errorSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'error message',
            context: 'ErrorContext',
          }),
        );
      });

      it('should not include stack when not provided', () => {
        const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();

        logger.error('error message');

        expect(errorSpy).toHaveBeenCalledWith(
          expect.not.objectContaining({
            stack: expect.anything(),
          }),
        );
      });
    });

    describe('warn', () => {
      it('should call iquriLogger.warn', () => {
        const warnSpy = jest.spyOn(iquriLogger, 'warn').mockImplementation();

        logger.warn('warning message');

        expect(warnSpy).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'warning message' }),
        );
      });

      it('should include context when provided', () => {
        const warnSpy = jest.spyOn(iquriLogger, 'warn').mockImplementation();

        logger.warn('warning message', 'WarnContext');

        expect(warnSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'warning message',
            context: 'WarnContext',
          }),
        );
      });
    });

    describe('debug', () => {
      it('should call iquriLogger.debug', () => {
        const debugSpy = jest.spyOn(iquriLogger, 'debug').mockImplementation();

        logger.debug('debug message');

        expect(debugSpy).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'debug message' }),
        );
      });
    });

    describe('verbose', () => {
      it('should call iquriLogger.verbose', () => {
        const verboseSpy = jest.spyOn(iquriLogger, 'verbose').mockImplementation();

        logger.verbose('verbose message');

        expect(verboseSpy).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'verbose message' }),
        );
      });
    });

    describe('setContext', () => {
      it('should update the context', () => {
        const infoSpy = jest.spyOn(iquriLogger, 'info').mockImplementation();

        logger.setContext('NewContext');
        logger.log('message');

        expect(infoSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            context: 'NewContext',
          }),
        );
      });
    });
  });

  describe('nestLogger singleton', () => {
    it('should export a singleton instance', () => {
      expect(nestLogger).toBeDefined();
      expect(nestLogger).toBeInstanceOf(IquriNestLogger);
    });

    it('should have all log methods', () => {
      expect(nestLogger.log).toBeDefined();
      expect(nestLogger.error).toBeDefined();
      expect(nestLogger.warn).toBeDefined();
      expect(nestLogger.debug).toBeDefined();
      expect(nestLogger.verbose).toBeDefined();
    });
  });
});

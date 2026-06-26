import { HttpException, HttpStatus } from '@nestjs/common';
import { IquriExceptionFilter } from './exception-filter';
import { iquriLogger } from './logger';
import { TracedRequest } from './interfaces';
import { Response } from 'express';

describe('IquriExceptionFilter', () => {
  let filter: IquriExceptionFilter;
  let mockRequest: Partial<TracedRequest>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: {
    switchToHttp: () => {
      getRequest: () => Partial<TracedRequest>;
      getResponse: () => Partial<Response>;
    };
  };

  beforeEach(() => {
    filter = new IquriExceptionFilter();

    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRequest = {
      method: 'GET',
      url: '/test',
      originalUrl: '/test',
      traceId: 'test-trace-id',
      serviceName: 'test-service',
      headers: {
        'x-trace-id': 'header-trace-id',
      },
    };

    mockResponse = {
      status: mockStatus,
    };

    mockHost = {
      switchToHttp: () => ({
        getRequest: () => mockRequest as TracedRequest,
        getResponse: () => mockResponse as Response,
      }),
    };
  });

  describe('catch', () => {
    it('should handle HttpException', () => {
      const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockHost as never);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not Found',
          traceId: 'test-trace-id',
        }),
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          traceId: 'test-trace-id',
          serviceName: 'test-service',
        }),
      );
    });

    it('should handle HttpException with object response', () => {
      const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();
      const exception = new HttpException(
        { message: 'Validation failed', errors: ['field1 is required'] },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost as never);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
        }),
      );
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should handle generic Error', () => {
      const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();
      const exception = new Error('Something went wrong');

      filter.catch(exception, mockHost as never);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        }),
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String),
        }),
      );
    });

    it('should handle unknown exception type', () => {
      const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();
      const exception = 'string error';

      filter.catch(exception, mockHost as never);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        }),
      );
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should use traceId from request object', () => {
      jest.spyOn(iquriLogger, 'error').mockImplementation();

      filter.catch(new Error('test'), mockHost as never);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: 'test-trace-id',
        }),
      );
    });

    it('should fallback to header traceId if request.traceId not set', () => {
      jest.spyOn(iquriLogger, 'error').mockImplementation();
      mockRequest.traceId = undefined;

      filter.catch(new Error('test'), mockHost as never);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: 'header-trace-id',
        }),
      );
    });

    it('should use "unknown" traceId if none available', () => {
      jest.spyOn(iquriLogger, 'error').mockImplementation();
      mockRequest.traceId = undefined;
      mockRequest.headers = {};

      filter.catch(new Error('test'), mockHost as never);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: 'unknown',
        }),
      );
    });

    it('should include timestamp in response', () => {
      jest.spyOn(iquriLogger, 'error').mockImplementation();

      filter.catch(new Error('test'), mockHost as never);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      );
    });

    it('should include path in response', () => {
      jest.spyOn(iquriLogger, 'error').mockImplementation();

      filter.catch(new Error('test'), mockHost as never);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/test',
        }),
      );
    });

    it('should log with ExceptionFilter context', () => {
      const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();

      filter.catch(new Error('test'), mockHost as never);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'ExceptionFilter',
        }),
      );
    });

    it('should include method in log', () => {
      const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();

      filter.catch(new Error('test'), mockHost as never);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
        }),
      );
    });

    it('should include url in log', () => {
      const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();

      filter.catch(new Error('test'), mockHost as never);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/test',
        }),
      );
    });

    it('should fallback to default serviceName when not set', () => {
      const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();
      mockRequest.serviceName = undefined;

      filter.catch(new Error('test'), mockHost as never);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceName: 'iquri-unknown-service',
        }),
      );
    });

    it('should fallback to url when originalUrl is not set', () => {
      const errorSpy = jest.spyOn(iquriLogger, 'error').mockImplementation();
      mockRequest.originalUrl = undefined;
      mockRequest.url = '/fallback-url';

      filter.catch(new Error('test'), mockHost as never);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/fallback-url',
        }),
      );
    });

    it('should handle HttpException with no message in response object', () => {
      jest.spyOn(iquriLogger, 'error').mockImplementation();
      const exception = new HttpException(
        { error: 'Bad Request', statusCode: 400 },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost as never);

      // Falls back to exception.message which is 'Http Exception' when response has no message
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Http Exception',
        }),
      );
    });

    it('should handle HttpException with string response', () => {
      jest.spyOn(iquriLogger, 'error').mockImplementation();
      const exception = new HttpException('Custom Error Message', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockHost as never);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Custom Error Message',
        }),
      );
    });
  });
});

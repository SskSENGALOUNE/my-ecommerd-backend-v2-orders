import { AsyncLocalStorage } from 'async_hooks';
import { RequestContext } from '../interfaces';

export const als = new AsyncLocalStorage<Map<keyof RequestContext, string>>();

export const getTraceId = (): string | undefined => {
  const store = als.getStore();
  return store?.get('traceId');
};

export const getServiceName = (): string | undefined => {
  const store = als.getStore();
  return store?.get('serviceName');
};

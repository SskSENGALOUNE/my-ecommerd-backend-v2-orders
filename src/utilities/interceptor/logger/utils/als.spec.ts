import { als, getTraceId, getServiceName } from './als';

describe('AsyncLocalStorage Utils', () => {
  afterEach(() => {
    // Exit any active store
    const store = als.getStore();
    if (store) {
      store.clear();
    }
  });

  describe('als', () => {
    it('should be defined', () => {
      expect(als).toBeDefined();
    });

    it('should run with a store', () => {
      const store = new Map<'traceId' | 'serviceName', string>();
      store.set('traceId', 'test-trace-id');

      als.run(store, () => {
        const currentStore = als.getStore();
        expect(currentStore).toBe(store);
        expect(currentStore?.get('traceId')).toBe('test-trace-id');
      });
    });
  });

  describe('getTraceId', () => {
    it('should return undefined when no store is active', () => {
      expect(getTraceId()).toBeUndefined();
    });

    it('should return traceId from active store', () => {
      const store = new Map<'traceId' | 'serviceName', string>();
      store.set('traceId', 'test-trace-123');

      als.run(store, () => {
        expect(getTraceId()).toBe('test-trace-123');
      });
    });

    it('should return undefined if traceId not set in store', () => {
      const store = new Map<'traceId' | 'serviceName', string>();
      store.set('serviceName', 'test-service');

      als.run(store, () => {
        expect(getTraceId()).toBeUndefined();
      });
    });
  });

  describe('getServiceName', () => {
    it('should return undefined when no store is active', () => {
      expect(getServiceName()).toBeUndefined();
    });

    it('should return serviceName from active store', () => {
      const store = new Map<'traceId' | 'serviceName', string>();
      store.set('serviceName', 'my-service');

      als.run(store, () => {
        expect(getServiceName()).toBe('my-service');
      });
    });

    it('should return undefined if serviceName not set in store', () => {
      const store = new Map<'traceId' | 'serviceName', string>();
      store.set('traceId', 'test-trace-id');

      als.run(store, () => {
        expect(getServiceName()).toBeUndefined();
      });
    });
  });

  describe('Nested contexts', () => {
    it('should handle nested store contexts', () => {
      const outerStore = new Map<'traceId' | 'serviceName', string>();
      outerStore.set('traceId', 'outer-trace');
      outerStore.set('serviceName', 'outer-service');

      const innerStore = new Map<'traceId' | 'serviceName', string>();
      innerStore.set('traceId', 'inner-trace');
      innerStore.set('serviceName', 'inner-service');

      als.run(outerStore, () => {
        expect(getTraceId()).toBe('outer-trace');
        expect(getServiceName()).toBe('outer-service');

        als.run(innerStore, () => {
          expect(getTraceId()).toBe('inner-trace');
          expect(getServiceName()).toBe('inner-service');
        });

        // Back to outer context
        expect(getTraceId()).toBe('outer-trace');
        expect(getServiceName()).toBe('outer-service');
      });
    });
  });
});

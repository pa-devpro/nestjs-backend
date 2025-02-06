import { ExecutionContext } from "@nestjs/common";

export const createMockContext = (data: {
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
}): ExecutionContext => {
  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: data.headers || {},
        body: data.body || {},
        params: data.params || {},
        query: data.query || {},
      }),
      getResponse: () => ({}),
    }),
  };

  return mockContext as ExecutionContext;
};

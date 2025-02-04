import { RequestTimeoutException } from "@nestjs/common";

export function Timeout(timeoutMs?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const DEFAULT_TIMEOUT = process.env.API_TIMEOUT
      ? parseInt(process.env.API_TIMEOUT)
      : 5000;

    descriptor.value = async function (...args: any[]) {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new RequestTimeoutException("Request timeout"));
        }, timeoutMs || DEFAULT_TIMEOUT);
      });

      return Promise.race([originalMethod.apply(this, args), timeoutPromise]);
    };
    return descriptor;
  };
}

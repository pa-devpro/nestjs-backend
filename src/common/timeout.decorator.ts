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
      let timer: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(new RequestTimeoutException("Request timeout"));
        }, timeoutMs || DEFAULT_TIMEOUT);
        // Unref the timer so it doesn't block node process exit
        if (timer.unref) {
          timer.unref();
        }
      });

      try {
        const result = await Promise.race([
          originalMethod.apply(this, args),
          timeoutPromise,
        ]);
        clearTimeout(timer);
        return result;
      } catch (error) {
        clearTimeout(timer);
        throw error;
      }
    };
    return descriptor;
  };
}

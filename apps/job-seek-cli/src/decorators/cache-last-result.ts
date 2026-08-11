const requestCache = new Map<string, any>();

export function CacheLastAsyncResult() {
  return function <T, Args extends any[], R>(
    target: T,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: Args) => Promise<R>>
  ): TypedPropertyDescriptor<(...args: Args) => Promise<R>> | void {
    const originalMethod = descriptor.value;

    if (!originalMethod) {
      return descriptor;
    }

    // Replace the method with a cached wrapper
    descriptor.value = async function (this: T, ...args: Args): Promise<R> {
      // Create a unique key using the method name and the arguments
      const cacheKey = `${String(propertyKey)}:${JSON.stringify(args)}`;

      if (requestCache.has(cacheKey)) {
        console.log(`[Cache] Returning cached data for: ${cacheKey}`);
        return requestCache.get(cacheKey);
      }

      // Execute original method with the correct class instance context ('this')
      const result = await originalMethod.apply(this, args);

      requestCache.set(cacheKey, result);
      return result;
    };

    return descriptor;
  };
}

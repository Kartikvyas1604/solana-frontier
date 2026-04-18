export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  backoff: boolean = true
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = backoff ? delayMs * Math.pow(2, i) : delayMs;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

export function exponentialBackoff(attempt: number, baseDelayMs: number = 1000): number {
  return Math.min(baseDelayMs * Math.pow(2, attempt), 30000);
}

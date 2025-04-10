interface RateLimiterOptions {
  maxRequests: number;
  timeWindowMs: number;
  maxConcurrent?: number;
  minDelayMs?: number;
}

class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindowMs: number;
  private maxConcurrent: number;
  private minDelayMs: number;
  private currentRequests: number = 0;
  private queue: (() => Promise<void>)[] = [];
  private lastRequestTime: number = 0;
  private consecutiveErrors: number = 0;

  constructor(options: RateLimiterOptions) {
    this.maxRequests = options.maxRequests;
    this.timeWindowMs = options.timeWindowMs;
    this.maxConcurrent = options.maxConcurrent || 1;
    this.minDelayMs = options.minDelayMs || 1000;
  }

  private async delay(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  private getBackoffDelay(): number {
    // Экспоненциальная задержка: начинаем с minDelayMs и удваиваем с каждой ошибкой
    return this.minDelayMs * Math.pow(2, this.consecutiveErrors);
  }

  private async processQueue() {
    while (this.queue.length > 0 && this.currentRequests < this.maxConcurrent) {
      const task = this.queue.shift();
      if (task) {
        this.currentRequests++;
        try {
          // Обеспечиваем минимальную задержку между запросами
          const timeSinceLastRequest = Date.now() - this.lastRequestTime;
          const backoffDelay = this.getBackoffDelay();
          const delayNeeded = Math.max(backoffDelay - timeSinceLastRequest, 0);
          
          if (delayNeeded > 0) {
            await this.delay(delayNeeded);
          }

          await task();
          this.lastRequestTime = Date.now();
          this.consecutiveErrors = Math.max(0, this.consecutiveErrors - 1); // Уменьшаем счетчик ошибок при успехе
        } catch (error) {
          if (error?.response?.status === 429) {
            this.consecutiveErrors++; // Увеличиваем счетчик ошибок при 429
            console.log(`Rate limit hit, increasing backoff delay to ${this.getBackoffDelay()}ms`);
          }
          throw error;
        } finally {
          this.currentRequests--;
          this.processQueue();
        }
      }
    }
  }

  async waitForAvailability(): Promise<void> {
    return new Promise((resolve, reject) => {
      const task = async () => {
        try {
          const now = Date.now();
          this.requests = this.requests.filter(time => now - time < this.timeWindowMs);

          if (this.requests.length >= this.maxRequests) {
            const oldestRequest = this.requests[0];
            const waitTime = oldestRequest + this.timeWindowMs - now;
            await this.delay(waitTime);
            return this.waitForAvailability();
          }

          this.requests.push(now);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      this.queue.push(task);
      if (this.currentRequests < this.maxConcurrent) {
        this.processQueue();
      }
    });
  }

  async processBatch<T>(
    items: T[],
    processor: (item: T) => Promise<void>,
    batchSize: number = 2
  ): Promise<void> {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    let batchIndex = 0;
    while (batchIndex < batches.length) {
      try {
        await Promise.all(batches[batchIndex].map(async (item) => {
          await this.waitForAvailability();
          return processor(item);
        }));
        // Увеличиваем задержку между батчами в зависимости от количества ошибок
        await this.delay(this.getBackoffDelay());
        batchIndex++; // Переходим к следующему батчу только при успехе
      } catch (error) {
        if (error?.response?.status === 429) {
          this.consecutiveErrors++;
          console.log(`Batch processing hit rate limit, increasing backoff delay to ${this.getBackoffDelay()}ms`);
          // Повторяем текущий батч после увеличенной задержки
          await this.delay(this.getBackoffDelay());
          // batchIndex не увеличивается, поэтому текущий батч будет повторен
        } else {
          throw error;
        }
      }
    }
  }
}

// Создаем более консервативный лимитер для OpenAI API
export const openAILimiter = new RateLimiter({
  maxRequests: 10,         // Максимум 10 запросов
  timeWindowMs: 60 * 1000, // в минуту
  maxConcurrent: 1,        // Только 1 запрос одновременно
  minDelayMs: 3000        // Минимум 3 секунды между запросами
}); 
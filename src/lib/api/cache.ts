interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private storage: Map<string, CacheEntry<any>> = new Map();
  private readonly TTL: number;

  constructor(ttlMinutes: number = 60) {
    this.TTL = ttlMinutes * 60 * 1000;
  }

  set<T>(key: string, value: T): void {
    this.storage.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  get<T>(key: string): T | null {
    const entry = this.storage.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.TTL) {
      this.storage.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.storage.clear();
  }
}

// Создаем кэш для результатов анализа (TTL: 1 час)
export const analysisCache = new Cache(60); 
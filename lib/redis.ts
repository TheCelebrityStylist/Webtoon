type RedisValue = string | number | boolean | Record<string, unknown> | unknown[] | null;

class InMemoryRedis {
  private kv = new Map<string, RedisValue>();
  private lists = new Map<string, string[]>();

  async set(key: string, value: RedisValue): Promise<void> {
    this.kv.set(key, value);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = this.kv.get(key);
    return (value as T | undefined) ?? null;
  }

  async rpush(key: string, value: string): Promise<number> {
    const list = this.lists.get(key) ?? [];
    list.push(value);
    this.lists.set(key, list);
    return list.length;
  }

  async lpop<T extends string>(key: string): Promise<T | null> {
    const list = this.lists.get(key) ?? [];
    const value = list.shift() ?? null;
    this.lists.set(key, list);
    return value as T | null;
  }

  async lrem(key: string, count: number, value: string): Promise<number> {
    const list = this.lists.get(key) ?? [];
    if (!list.length) return 0;

    let removed = 0;
    const removeOne = () => {
      const index = list.indexOf(value);
      if (index === -1) return false;
      list.splice(index, 1);
      removed += 1;
      return true;
    };

    if (count === 0) {
      while (removeOne()) {
        // remove all
      }
    } else {
      const limit = Math.abs(count);
      while (removed < limit && removeOne()) {
        // remove up to count
      }
    }

    this.lists.set(key, list);
    return removed;
  }
}

export const redis = new InMemoryRedis();

export const redisKeys = {
  job: (jobId: string) => `lookjob:${jobId}`,
  queue: "lookjob:queue",
};

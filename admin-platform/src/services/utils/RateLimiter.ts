interface RateLimiterConfig {
    maxRequests: number;
    perTimeWindow: number;  // in seconds
}

interface RateLimitEntry {
    count: number;
    firstRequest: number;
    lastRequest: number;
}

export class RateLimiter {
    private limits: Map<string, RateLimitEntry>;
    private config: RateLimiterConfig;

    constructor(config: RateLimiterConfig) {
        this.limits = new Map();
        this.config = config;
    }

    async checkLimit(key: string): Promise<boolean> {
        const now = Date.now();
        const entry = this.limits.get(key);

        if (!entry) {
            this.limits.set(key, {
                count: 1,
                firstRequest: now,
                lastRequest: now
            });
            return true;
        }

        if (now - entry.firstRequest > this.config.perTimeWindow * 1000) {
            this.limits.set(key, {
                count: 1,
                firstRequest: now,
                lastRequest: now
            });
            return true;
        }

        if (entry.count >= this.config.maxRequests) {
            const timeUntilReset = (entry.firstRequest + (this.config.perTimeWindow * 1000) - now) / 1000;
            throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(timeUntilReset)} seconds.`);
        }

        entry.count++;
        entry.lastRequest = now;
        this.limits.set(key, entry);

        return true;
    }

    getRemainingRequests(key: string): number {
        const entry = this.limits.get(key);
        if (!entry) {
            return this.config.maxRequests;
        }
        return Math.max(0, this.config.maxRequests - entry.count);
    }

    reset(key: string): void {
        this.limits.delete(key);
    }

    resetAll(): void {
        this.limits.clear();
    }
}

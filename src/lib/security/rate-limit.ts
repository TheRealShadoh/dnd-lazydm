/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or similar
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const limiters = new Map<string, Map<string, RateLimitEntry>>();

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per interval
}

/**
 * Rate limiter factory
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { interval, maxRequests } = config;
  const limiterKey = `${interval}_${maxRequests}`;

  if (!limiters.has(limiterKey)) {
    limiters.set(limiterKey, new Map());
  }

  const limiter = limiters.get(limiterKey)!;

  return {
    /**
     * Check if request is allowed for this identifier
     * Returns true if allowed, false if rate limited
     */
    check: (identifier: string): boolean => {
      const now = Date.now();
      const entry = limiter.get(identifier);

      // No entry or expired - allow and create new entry
      if (!entry || now > entry.resetTime) {
        limiter.set(identifier, {
          count: 1,
          resetTime: now + interval,
        });
        return true;
      }

      // Within rate limit
      if (entry.count < maxRequests) {
        entry.count++;
        return true;
      }

      // Rate limited
      return false;
    },

    /**
     * Get remaining requests for identifier
     */
    remaining: (identifier: string): number => {
      const entry = limiter.get(identifier);
      if (!entry || Date.now() > entry.resetTime) {
        return maxRequests;
      }
      return Math.max(0, maxRequests - entry.count);
    },

    /**
     * Get reset time for identifier
     */
    resetTime: (identifier: string): number => {
      const entry = limiter.get(identifier);
      if (!entry || Date.now() > entry.resetTime) {
        return Date.now() + interval;
      }
      return entry.resetTime;
    },

    /**
     * Clear rate limit for identifier (useful for testing)
     */
    reset: (identifier: string): void => {
      limiter.delete(identifier);
    },
  };
}

/**
 * Cleanup old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  limiters.forEach((limiter) => {
    limiter.forEach((entry, key) => {
      if (now > entry.resetTime) {
        limiter.delete(key);
      }
    });
  });
}, 60000); // Clean up every minute

// Pre-configured rate limiters
export const authRateLimiter = createRateLimiter({
  interval: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
});

export const apiRateLimiter = createRateLimiter({
  interval: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

export const strictRateLimiter = createRateLimiter({
  interval: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
});

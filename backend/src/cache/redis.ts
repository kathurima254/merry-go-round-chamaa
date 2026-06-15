import * as redis from 'redis';
import { logger } from '../utils/logger';

let redisClient: redis.RedisClientType;

export async function initializeRedis(): Promise<void> {
  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    }) as any;

    redisClient.on('error', (err) => logger.error('Redis error:', err));
    redisClient.on('connect', () => logger.info('Redis connected'));

    await redisClient.connect();
  } catch (error) {
    logger.error('Redis initialization failed:', error);
    throw error;
  }
}

export async function setCache(
  key: string,
  value: any,
  expirySeconds: number = 3600
): Promise<void> {
  try {
    await redisClient.setEx(key, expirySeconds, JSON.stringify(value));
  } catch (error) {
    logger.error('Cache set error:', error);
  }
}

export async function getCache(key: string): Promise<any> {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error('Cache delete error:', error);
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
}

export { redisClient };

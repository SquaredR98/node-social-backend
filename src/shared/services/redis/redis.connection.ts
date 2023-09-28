import Logger from 'bunyan';
import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';

const logger: Logger = config.createLogger('REDIS-SETUP');

class RedisConnection extends BaseCache {
  constructor() {
    super('redis-connection');
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      const res = await this.client.ping();
      logger.info(res, 'Connected to Redis Successfully...');
    } catch (error) {
      logger.error(error);
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
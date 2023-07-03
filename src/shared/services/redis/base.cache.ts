import { createClient } from 'redis';
import Logger from 'bunyan';
import { config } from '@root/config';

export type RedisClient = ReturnType<typeof createClient>;

/** 
 * 
 * A base class for the caching implementations
 * for generalizing the methods and initiations 
 * of the redis. The following base class will 
 * be inherited by all the caching classes.
 * 
*/

export abstract class BaseCache {
  client: RedisClient;
  logger: Logger;

  constructor(cacheName: string) {
    this.client = createClient({ url: config.REDIS_HOST });
    this.logger = config.createLogger(cacheName);
    this.cacheError();
  }

  private cacheError(): void {
    this.client.on('error', (error: unknown) => {
      this.logger.error(error);
    });
  }
}
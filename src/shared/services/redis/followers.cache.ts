import { BaseCache } from '@services/redis/base.cache';
import { config } from '@root/config';
import Logger from 'bunyan';
import { ServerError } from '../../globals/helpers/error-handler';

const logger: Logger = config.createLogger('FOLLOWERS');

export class FollowersCache extends BaseCache {
  constructor() {
    super('followersCache');
  }

  public async saveFollowerToCache (key: string, value: string): Promise<void>{
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }

      await this.client.LPUSH(key, value);
    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Please try again');
    }
  }

  public async removeFollowerFromCache (key: string, value: string): Promise<void>{
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }

      await this.client.LREM(key, 1, value);
    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Please try again');
    }
  }
  public async updateFollowersCountInCache (userId: string, prop: string, value: number): Promise<void>{
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }

      await this.client.HINCRBY(`users:${userId}`, prop, value);
    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Please try again');
    }
  }
 }
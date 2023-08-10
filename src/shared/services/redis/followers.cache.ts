import { BaseCache } from '@services/redis/base.cache';
import { config } from '@root/config';
import Logger from 'bunyan';
import { ServerError } from '@globals/helpers/error-handler';
import { IFollowerData } from '@followers/interfaces/follower.interface';
import { UserCache } from './user.cache';
import { IUserDocument } from '../../../features/user/interfaces/user.interface';
import mongoose from 'mongoose';

const logger: Logger = config.createLogger('FOLLOWERS');
const userCache: UserCache = new UserCache();

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

  public async fetchFollowersFromCache (key: string): Promise<IFollowerData[]>{
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }

      const response: string[] = await this.client.LRANGE(key, 0, -1);
      const list: IFollowerData[] = [];
      for(const item of response) {
        const user: IUserDocument = await userCache.getUserFromCache(item) as IUserDocument;
        const data: IFollowerData = {
          _id: new mongoose.Types.ObjectId(user._id),
          username: user.username!,
          avatarColor: user.avatarColor!,
          postCount: user.postsCount,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          profilePicture: user.profilePicture,
          uId: user.uId!,
          userProfile: user
        };
        list.push(data);
      }

      return list;
    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Please try again');
    }
  }
 }
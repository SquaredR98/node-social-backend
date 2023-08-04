import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import { ServerError } from '@globals/helpers/error-handler';
import { Helpers } from '@globals/helpers/helpers';
import Logger from 'bunyan';
import { ICommentDocument, ICommentNameList } from '../../../features/comments/interfaces/comment.interface';
import { find } from 'lodash';


const logger: Logger = config.createLogger('COMMENTS-CACHE');

export class CommentsCache extends BaseCache {
  constructor() {
    super('comments');
  }

  public async savePostCommentToCache(postId: string, value: string): Promise<void> {
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }

      await this.client.LPUSH(`comments:${postId}`, value);
      const commentsCount: string[] = await this.client.HMGET(`posts:${postId}`, 'commentsCount');
      let count: number = Helpers.parseJson(commentsCount[0]) as number;
      count += 1;

      await this.client.HSET(`posts:${postId}`, 'commentsCount', `${count}`);
    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getCommentsFromCache(postId: string): Promise<ICommentDocument[]> {
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }

      const reply: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const list: ICommentDocument[] = [];

      for(const item of reply) {
        list.push(Helpers.parseJson(item));
      }

      return list;
    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Try again');
    }
  }
  
  public async getCommentsNameFromCache(postId: string): Promise<ICommentNameList[]> {
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }

      const commentsCount: number = await this.client.LLEN(`comments:${postId}`);
      const comments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const list: string[] = [];

      for(const item of comments) {
        const comment: ICommentDocument = Helpers.parseJson(item) as ICommentDocument;
        list.push(comment.username);
      }

      const response: ICommentNameList = {
        count: commentsCount,
        names: list
      };

      return [response];
    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getSingleCommentFromCache(postId: string, commentId: string): Promise<ICommentDocument[]> {
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }

      const comments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const list: ICommentDocument[] = [];

      for(const item of comments) {
        list.push(Helpers.parseJson(item));
      }

      const result: ICommentDocument = find(list, (listItem: ICommentDocument) => listItem._id === commentId) as ICommentDocument;

      return [result];
    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Try again');
    }
  }
}
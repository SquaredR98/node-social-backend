import Logger from 'bunyan';
import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import { ServerError } from '@globals/helpers/error-handler';
import { IReactionDocument, IReactions } from '@reactions/interfaces/reaction.interface';
import { Helpers } from '../../globals/helpers/helpers';
import { find } from 'lodash';

const logger: Logger = config.createLogger('REACTION-CACHE');

export class ReactionCache extends BaseCache {
  constructor() {
    super('ReactionCache');
  }

  public async savePostReactionToCache(
    key: string,
    reaction: IReactionDocument,
    postReactions: IReactions,
    type: string,
    previousReaction: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      if (previousReaction) {
        this.removePostReactionFromCache(key, reaction.username, postReactions);
      }

      if (type) {
        await this.client.LPUSH(`reactions:${key}`, JSON.stringify(reaction));
        await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
      }
    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async removePostReactionFromCache(
    key: string,
    username: string,
    postReactions: IReactions
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1);
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      const userPreviousReaction: IReactionDocument = this.getPreviousReaction(
        response,
        username
      ) as IReactionDocument;

      multi.LREM(`reactions:${key}`, 1, JSON.stringify(userPreviousReaction));
      await multi.exec();

      await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getReactionsFromCache(postId: string): Promise<[IReactionDocument[], number]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reactionCount: number = await this.client.LLEN(`reactions:${postId}`);
      const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);

      const list: IReactionDocument[] = [];
      for (const item of response) {
        list.push(Helpers.parseJson(item));
      }

      return response.length ? [list, reactionCount] : [[], 0];
    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getSingleReactionByUsernameFromCache(
    postId: string,
    username: string
  ): Promise<IReactionDocument> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const list: IReactionDocument[] = [];
      for (const item of response) {
        list.push(Helpers.parseJson(item));
      }

      const result: IReactionDocument = find(
        list,
        (listItem: IReactionDocument) => listItem?.username === username
      ) as IReactionDocument;
      return result;
    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  private getPreviousReaction(response: string[], username: string): IReactionDocument | undefined {
    const list: IReactionDocument[] = [];

    for (const item of response) {
      list.push(Helpers.parseJson(item) as IReactionDocument);
    }

    return find(list, (listItem: IReactionDocument) => {
      return listItem.username === username;
    });
  }
}

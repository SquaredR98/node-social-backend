import Logger from 'bunyan';
import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import { ServerError } from '@globals/helpers/error-handler';
import { IReactionDocument, IReactions } from '@reactions/interfaces/reaction.interface';


const logger: Logger = config.createLogger('REACTION-CACHE');

export class ReactionCache extends BaseCache {
  constructor () {
    super('ReactionCache');
  }

  public async savePostReactionToCache(
    key: string,
    reaction: IReactionDocument,
    postReaction: IReactions,
    type: string,
    previousReaction: string
  ): Promise<void> {
    try {
      if(!this.client.isOpen) {
        await this.client.connect();
      }

      if (previousReaction) {
        //call remove reaction method
      }

      if (type) {
        await this.client.LPUSH(`reactions${key}`, JSON.stringify(reaction));
        const dataToSave: string[] = ['reactions', JSON.stringify(postReaction)];
        await this.client.HSET(`posts:${key}`, dataToSave);
      }


    } catch (error) {
      logger.error(error);
      throw new ServerError('Server error. Try again');
    }
  }
}


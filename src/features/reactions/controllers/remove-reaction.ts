import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { removeReactionSchema } from '@reactions/schemes/reactions';
import { IReactionJob } from '@reactions/interfaces/reaction.interface';
import { ReactionCache } from '@services/redis/reactions.cache';
import { reactionQueue } from '../../../shared/services/queues/reaction.queue';

const reactionCache: ReactionCache = new ReactionCache();

export class Remove {
  @joiValidation(removeReactionSchema)
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, previousReaction, postReactions } = req.params;

    await reactionCache.removePostReactionFromCache(postId, `${req.currentUser?.username}`, JSON.parse(postReactions));

    const databaseReactionData: IReactionJob = {
      postId,
      username: req.currentUser!.username,
      previousReaction,
    };

    reactionQueue.addReactionJob('removeReactionFromDB', databaseReactionData);

    res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed successfully'});
  }
}

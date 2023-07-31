import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { addReactionSchema } from '@reactions/schemes/reactions';
import { IReactionDocument } from '@reactions/interfaces/reaction.interface';
import { ReactionCache } from '@services/redis/reactions.cache';

const reactionCache: ReactionCache = new ReactionCache();

export class Reactions {
  @joiValidation(addReactionSchema)
  public async add(req: Request, res: Response): Promise<void> {
    const { userTo, postId, type, previousReaction, postReactions, profilePicture } = req.body;
    const reactionObject: IReactionDocument = {
      _id: new ObjectId(),
      postId,
      type,
      profilePicture,
      avataColor: req.currentUser?.avatarColor,
      username: req.currentUser?.username
    } as IReactionDocument;

    await reactionCache.savePostReactionToCache(
      postId,
      reactionObject,
      postReactions,
      type,
      previousReaction
    );

    res.status(HTTP_STATUS.OK).json({ message: 'Reaction added successfully'});
  }
}

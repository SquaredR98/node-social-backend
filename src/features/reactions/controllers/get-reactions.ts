import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ReactionCache } from '@services/redis/reactions.cache';
import { IReactionDocument } from '@reactions/interfaces/reaction.interface';
import { reactionService } from '@services/db/reaction.service';
import mongoose from 'mongoose';

const reactionCache: ReactionCache = new ReactionCache();

export class Get {
  public async reactions(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedReactions: [IReactionDocument[], number] =
      await reactionCache.getReactionsFromCache(postId);
    const reactions: [IReactionDocument[], number] = cachedReactions[0].length
      ? cachedReactions
      : await reactionService.getPostReactions(
          { postId: new mongoose.Types.ObjectId(postId) },
          { createdAt: -1 }
        );
    res.status(HTTP_STATUS.OK).json({
      message: 'Reaction fetched successfully',
      reactions: reactions[0],
      count: reactions[1]
    });
  }

  public async singleReactionByUsername(req: Request, res: Response): Promise<void> {
    const { postId, username } = req.params;
    const cachedReaction: IReactionDocument =
      await reactionCache.getSingleReactionByUsernameFromCache(postId, username);
    const reaction: IReactionDocument = Object.entries(cachedReaction).length
      ? cachedReaction
      : await reactionService.getSinglePostReactionByUsername(postId, username);
    res.status(HTTP_STATUS.OK).json({
      message: 'Reaction fetched successfully',
      reaction
    });
  }

  public async reactionsByUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const reaction: IReactionDocument[] = await reactionService.getReactionsByUsername(username);
    res.status(HTTP_STATUS.OK).json({
      message: 'Reaction fetched successfully',
      reaction,
      count: reaction.length
    });
  }
}

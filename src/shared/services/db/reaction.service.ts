import { IReactionDocument, IReactionJob } from '@reactions/interfaces/reaction.interface';
import { UserCache } from '@services/redis/user.cache';
import { ReactionModel } from '../../../features/reactions/models/reaction.schema';
import { PostModel } from '../../../features/post/models/post.schema';
import { IUserDocument } from '../../../features/user/interfaces/user.interface';
import { IPostDocument } from '../../../features/post/interfaces/post.interface';
import { omit } from 'lodash';

const userCache: UserCache = new UserCache();

class ReactionService {
  public async addReactionToDB(reactionData: IReactionJob): Promise<void> {
    const { postId, userTo, userFrom, username, type, previousReaction, reactionObject } =
      reactionData;

    let updatedReactionObject: IReactionDocument = reactionObject as IReactionDocument;

    if(!previousReaction) {
      updatedReactionObject = omit(reactionObject, ['_id']);
    }
    const updateReaction: [IUserDocument, IReactionDocument, IPostDocument] = await Promise.all([
      userCache.getUserFromCache(`${userTo}`),
      ReactionModel.replaceOne({ postId, type: previousReaction, username }, updatedReactionObject, {
        upsert: true
      }),
      PostModel.findOneAndUpdate(
        { _id: postId },
        { $inc: { [`reactions.${previousReaction}`]: -1, [`reactions.${type}`]: 1 } },
        { new: true }
      )
    ]) as unknown as [IUserDocument, IReactionDocument, IPostDocument];

    // Send reactions notification
  }

  public async removeReactionDataFromDB(reactionData: IReactionJob): Promise<void> {
    const { postId, previousReaction, username } = reactionData;

    Promise.all([
      ReactionModel.deleteOne({ postId, type: previousReaction, username }),
      PostModel.findOneAndUpdate(
        { _id: postId },
        { $inc: { [`reactions.${previousReaction}`]: -1, } },
      )
    ]);
  }
}

export const reactionService: ReactionService = new ReactionService();

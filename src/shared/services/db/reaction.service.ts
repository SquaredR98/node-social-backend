import { omit } from 'lodash';
import mongoose from 'mongoose';
import {
  IQueryReaction,
  IReactionDocument,
  IReactionJob
} from '@reactions/interfaces/reaction.interface';
import { UserCache } from '@services/redis/user.cache';
import { ReactionModel } from '@reactions/models/reaction.schema';
import { PostModel } from '@post/models/post.schema';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IPostDocument } from '@post/interfaces/post.interface';
import { INotification, INotificationDocument, INotificationTemplate } from '../../../features/notification/interfaces/notification.interface';
import { NotificationModel } from '../../../features/notification/models/notification.schema';
import { socketIoNotificationObject } from '../../sockets/notification';
import { notificationTemplate } from '../emails/templates/notification/notification-template';
import { emailQueue } from '../queues/email.queue';

const userCache: UserCache = new UserCache();

class ReactionService {
  public async addReactionToDB(reactionData: IReactionJob): Promise<void> {
    const { postId, userTo, userFrom, username, type, previousReaction, reactionObject } =
      reactionData;

    let updatedReactionObject: IReactionDocument = reactionObject as IReactionDocument;

    if (!previousReaction) {
      updatedReactionObject = omit(reactionObject, ['_id']);
    }
    const updateReaction: [IUserDocument, IReactionDocument, IPostDocument] = (await Promise.all([
      userCache.getUserFromCache(`${userTo}`),
      ReactionModel.replaceOne(
        { postId, type: previousReaction, username },
        updatedReactionObject,
        {
          upsert: true
        }
      ),
      PostModel.findOneAndUpdate(
        { _id: postId },
        { $inc: { [`reactions.${previousReaction}`]: -1, [`reactions.${type}`]: 1 } },
        { new: true }
      )
    ])) as unknown as [IUserDocument, IReactionDocument, IPostDocument];

    if (updateReaction[0]?.notifications.reactions && userTo !== userFrom) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom,
        userTo,
        message: `${username} reacted to your post`,
        notificationType: 'follow',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(updateReaction[1]._id),
        createdAt: new Date(),
        post: updateReaction[2].post,
        imgId: updateReaction[2].imgId,
        imgVersion: updateReaction[2].imgVersion,
        gifUrl: updateReaction[2].gifUrl,
        reaction: type,
      } as INotification);

      // Send to client using socket
      socketIoNotificationObject.emit('insert notification', notifications, { userTo });

      // Send to email queue
      const templateParams: INotificationTemplate = {
        username: updateReaction[0]?.username as string,
        message: `${username} reacted to your post.`,
        header: 'Someone reacted to your post'
      };

      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob('reactionsEmail', {
        receiverEmail: updateReaction[0]?.email as string,
        template,
        subject: 'Follow Notification'
      });
    }
  }

  public async removeReactionDataFromDB(reactionData: IReactionJob): Promise<void> {
    const { postId, previousReaction, username } = reactionData;

    Promise.all([
      ReactionModel.deleteOne({ postId, type: previousReaction, username }),
      PostModel.findOneAndUpdate(
        { _id: postId },
        { $inc: { [`reactions.${previousReaction}`]: -1 } }
      )
    ]);
  }

  public async getPostReactions(
    query: IQueryReaction,
    sort: Record<string, 1 | -1>
  ): Promise<[IReactionDocument[], number]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: query },
      { $sort: sort }
    ]);

    return [reactions, reactions.length];
  }

  public async getSinglePostReactionByUsername(
    postId: string,
    username: string
  ): Promise<IReactionDocument> {
    const reactions: IReactionDocument = (await ReactionModel.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(postId), username } }
    ]))[0];

    return reactions;
  }

  public async getReactionsByUsername(
    username: string
  ): Promise<IReactionDocument[]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: { username } }
    ]);

    return reactions;
  }
}

export const reactionService: ReactionService = new ReactionService();

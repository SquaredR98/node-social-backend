import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '../../../features/notification/models/notification.schema';
import { Types } from 'mongoose';


class NotificationService {
  public async getNotification(userId: string): Promise<INotificationDocument[]> {
    const notifications = await NotificationModel.aggregate([
      { $match: { userTo: new Types.ObjectId(userId) }},
      { $lookup: { from: 'User', localField: 'userFrom', foreignField: '_id', as: 'userFrom' } },
      { $unwind: '$userFrom' },
      { $lookup: { from: 'Auth', localField: 'userFrom.authId', foreignField: '_id', as: 'auth' } },
      { $unwind: '$auth' },
      {
        $project: {
          _id: 1,
          message: 1,
          comment: 1,
          createdAt: 1,
          createdItemId: 1,
          entityId: 1,
          notificationType: 1,
          gifUrl: 1,
          imgId: 1,
          imgVersion: 1,
          post: 1,
          reaction: 1,
          read: 1,
          userTo: 1,
          userFrom: {
            profilePicture: '$userFrom.profilePicture',
            username: '$auth.username',
            avatarColor: '$auth.avatarColor',
            uId: '$auth.uId'
          }
        }
      }
    ]);
    return notifications;
  }
}

export const notificationService: NotificationService = new NotificationService();
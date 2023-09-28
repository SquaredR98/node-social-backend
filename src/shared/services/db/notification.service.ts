import { INotificationDocument } from '@notifications/interfaces/notification.interface';
import { NotificationModel } from '../../../features/notifications/models/notification.schema';
import mongoose from 'mongoose';
import { UserModel } from '../../../features/user/models/user.schema';


class NotificationService {
  public async getNotification(userId: string): Promise<INotificationDocument[]> {
    console.log(userId)
    const notifications = await NotificationModel.aggregate([
      { $match: { userTo: new mongoose.Types.ObjectId(userId) }},
      // { $lookup: { from: UserModel.collection.name, localField: 'userFrom', foreignField: '_id', as: 'userFrom' } },
      // { $unwind: '$userFrom' },
      // { $lookup: { from: 'Auth', localField: 'userFrom.authId', foreignField: '_id', as: 'auth' } },
      // { $unwind: '$auth' },
      // {
      //   $project: {
      //     _id: 1,
      //     message: 1,
      //     comment: 1,
      //     createdAt: 1,
      //     createdItemId: 1,
      //     entityId: 1,
      //     notificationType: 1,
      //     gifUrl: 1,
      //     imgId: 1,
      //     imgVersion: 1,
      //     post: 1,
      //     reaction: 1,
      //     read: 1,
      //     userTo: 1,
      //     userFrom: {
      //       profilePicture: '$userFrom.profilePicture',
      //       username: '$auth.username',
      //       avatarColor: '$auth.avatarColor',
      //       uId: '$auth.uId'
      //     }
      //   }
      // }
    ]);
    return notifications;
  }

  public async updateNotification(notificationId: string): Promise<void> {
    await NotificationModel.updateOne({ _id: notificationId }, { $set: { read: true } }).exec();
  }

  public async deleteNotification(notificationId: string): Promise<void> {
    await NotificationModel.deleteOne({ _id: notificationId }).exec();
  }
}

export const notificationService: NotificationService = new NotificationService();
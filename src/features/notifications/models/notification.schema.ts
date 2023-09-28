import Logger from 'bunyan';
import mongoose, { Model, Schema, model } from 'mongoose';

import { config } from '@root/config';
import {
  INotification,
  INotificationDocument
} from '@notifications/interfaces/notification.interface';
import { notificationService } from '@services/db/notification.service';

const logger: Logger = config.createLogger('Notification Schema');

const notificationSchema: Schema = new Schema(
  {
    userTo: { type: mongoose.Types.ObjectId, ref: 'User', index: true },
    userFrom: { type: mongoose.Types.ObjectId, ref: 'User' },
    read: { type: Boolean, default: false },
    message: { type: String, default: '' },
    notificationType: { type: String, enum: ['comment', 'followed'] },
    entityItemId: { type: mongoose.Types.ObjectId },
    createdItemId: { type: mongoose.Types.ObjectId },
    comment: { type: String, default: '' },
    reaction: { type: String, default: '' },
    post: { type: String, default: '' },
    imgId: { type: String, default: '' },
    imgVersion: { type: String, default: '' },
    gifUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

notificationSchema.methods.insertNotification = async (data: INotification) => {
  const {
    userTo,
    userFrom,
    message,
    notificationType,
    entityId,
    createdItemId,
    comment,
    reaction,
    post,
    imgId,
    imgVersion,
    gifUrl
  } = data;

  await NotificationModel.create({
    userTo,
    userFrom,
    message,
    notificationType,
    entityId,
    createdItemId,
    comment,
    reaction,
    post,
    imgId,
    imgVersion,
    gifUrl
  });

  try {
    const notifications: INotificationDocument[] = await notificationService.getNotification(
      userTo
    );
    return notifications;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const NotificationModel: Model<INotificationDocument> = model<INotificationDocument>(
  'Notification',
  notificationSchema,
  'Notification'
);

export { NotificationModel };

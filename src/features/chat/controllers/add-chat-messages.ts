import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';

import { config } from '@root/config';
import {
  IMessageData,
  IMessageNotification
} from '../interfaces/chat.interface';
import { socketIOChatObject } from '@sockets/chat';
import { addChatSchema } from '@chat/schemes/chat';
import { UserCache } from '@services/redis/user.cache';
import { emailQueue } from '@services/queues/email.queue';
import { upload } from '@globals/helpers/cloudinary-upload';
import { MessageCache } from '@services/redis/messages.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { BadRequestError } from '@globals/helpers/error-handler';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { INotificationTemplate } from '@notifications/interfaces/notification.interface';
import { notificationTemplate } from '@services/emails/templates/notification/notification-template';

const userCache: UserCache = new UserCache();
const messageCache: MessageCache = new MessageCache();

export class Add {
  @joiValidation(addChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    const {
      conversationId,
      receiverId,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      body,
      gifUrl,
      isRead,
      selectedImage
    }: IMessageData = req.body;

    let fileUrl = '';
    const messageObjId: ObjectId = new ObjectId();
    const conversationObjId: ObjectId = !conversationId
      ? new ObjectId()
      : new ObjectId(conversationId);

    const sender: IUserDocument | null = await userCache.getUserFromCache(
      `${req.currentUser?.userId}`
    );

    if (selectedImage.length) {
      const result: UploadApiResponse = (await upload(
        req.body.image,
        req.currentUser?.userId,
        true,
        true
      )) as UploadApiResponse;

      if (result?.public_id) {
        throw new BadRequestError(result?.message);
      }

      fileUrl = `https://res.cloudinary.com/${
        config.NODE_ENV === 'production'
          ? config.CLOUD_NAME
          : config.DEV_CLOUD_NAME
      }/image/upload/v${result?.version}/${result?.public_id}`;
    }

    const messageData: IMessageData = {
      _id: `${messageObjId}`,
      conversationId: new mongoose.Types.ObjectId(conversationObjId),
      receiverId,
      receiverAvatarColor,
      receiverProfilePicture,
      receiverUsername,
      senderUsername: `${req.currentUser?.username}`,
      senderAvatarColor: `${req.currentUser?.avatarColor}`,
      senderId: `${req.currentUser?.userId}`,
      senderProfilePicture: `${sender?.profilePicture}`,
      body,
      isRead,
      gifUrl,
      selectedImage: fileUrl,
      reaction: [],
      createdAt: new Date(),
      deleteForEveryone: false,
      deleteForMe: false
    };

    Add.prototype.emitSocketIoEvent(messageData);

    if (!isRead) {
      Add.prototype.messageNotification({
        currentUser: req.currentUser!,
        message: body,
        receiverId,
        receiverName: receiverUsername,
        messageData
      });
    }

    /**
     * 4. Add message to chat queue
     */

    await messageCache.addChatListToCache(
      `${req.currentUser?.userId}`,
      `${receiverId}`,
      `${conversationObjId}`
    );

    await messageCache.addChatListToCache(
      `${receiverId}`,
      `${req.currentUser?.userId}`,
      `${conversationObjId}`
    );

    await messageCache.addChatMessagesToCache(
      `${conversationObjId}`,
      messageData
    );

    res.status(HTTP_STATUS.OK).json({
      message: 'Message sent successfully',
      conversationId: conversationObjId
    });
  }

  public async addChatUsers(req: Request, res: Response): Promise<void> {
    const chatUsers = await messageCache.addChatUsersToCache(req.body);
    socketIOChatObject.emit('add chat users', chatUsers);
    res.status(HTTP_STATUS.OK).json({
      message: 'User added to chat successfully'
    });
  }

  public async removeChatUsers(req: Request, res: Response): Promise<void> {
    const chatUsers = await messageCache.removeChatUsersFromCache(req.body);
    socketIOChatObject.emit('removed chat users', chatUsers);
    res.status(HTTP_STATUS.OK).json({
      message: 'User removed from chat successfully'
    });
  }

  private emitSocketIoEvent(data: IMessageData): void {
    socketIOChatObject.emit('message received', data);
    socketIOChatObject.emit('chat list', data);
  }

  private async messageNotification({
    currentUser,
    message,
    receiverId,
    receiverName
  }: IMessageNotification): Promise<void> {
    const receiver: IUserDocument | null = await userCache.getUserFromCache(
      `${receiverId}`
    );

    if (receiver?.notifications?.messages) {
      const templateParams: INotificationTemplate = {
        username: receiverName,
        message: message,
        header: `Message notification from ${currentUser.username}`
      };

      const template: string =
        notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob('directMessageEmail', {
        receiverEmail: receiver?.email!,
        template,
        subject: `Message received from ${currentUser.username}`
      });
    }
  }
}

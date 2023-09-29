import { IMessageData } from '@chat/interfaces/chat.interface';
import { ConversationModel } from '@chat/models/conversation.schema';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { MessageModel } from '../../../features/chat/models/chat.schema';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

class ChatService {
  public async addMessageToDB(data: IMessageData): Promise<void> {
    const {
      _id,
      conversationId,
      receiverId,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      senderUsername,
      senderId,
      senderAvatarColor,
      senderProfilePicture,
      body,
      isRead,
      gifUrl,
      selectedImage,
      reaction,
      createdAt,
      deleteForMe,
      deleteForEveryone
    } = data;
    const conversation: IConversationDocument[] = await ConversationModel.find({
      _id: conversationId
    }).exec();

    if (!conversation.length) {
      await ConversationModel.create({
        _id: conversationId,
        senderId,
        receiverId
      });
    }

    await MessageModel.create({
      _id,
      conversationId,
      receiverId,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      senderId,
      senderAvatarColor,
      senderProfilePicture,
      senderUsername,
      body,
      isRead,
      gifUrl,
      selectedImage,
      reaction,
      createdAt
    });
  }

  public async getUserConversationsList(
    userId: ObjectId
  ): Promise<IMessageData[]> {
    const messages: IMessageData[] = await MessageModel.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      {
        $group: {
          _id: '$conversationId',
          result: { $last: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: '$result._id',
          conversationId: '$result.conversationId',
          receiverId: '$result.receiverId',
          receiverUsername: '$result.receiverUsername',
          receiverAvatarColor: '$result.receiverAvatarColor',
          receiverProfilePicture: '$result.receiverProfilePicture',
          senderUsername: '$result.senderUsername',
          senderId: '$result.senderId',
          senderAvatarColor: '$result.senderAvatarColor',
          senderProfilePicture: '$result.senderProfilePicture',
          body: '$result.body',
          isRead: '$result.isRead',
          gifUrl: '$result.gifUrl',
          selectedImage: '$result.selectedImage',
          reaction: '$result.reaction',
          createdAt: '$result.createdAt'
        }
      },
      {
        $sort: { createdAt: 1 }
      }
    ]);

    return messages;
  }
}

export const chatService: ChatService = new ChatService();

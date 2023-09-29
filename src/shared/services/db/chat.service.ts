import { IMessageData } from '@chat/interfaces/chat.interface';
import { ConversationModel } from '@chat/models/conversation.schema';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { MessageModel } from '../../../features/chat/models/chat.schema';

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
        receiverId,

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
    })
  }
}

export const chatService: ChatService = new ChatService();

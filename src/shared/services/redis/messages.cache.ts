import Logger from 'bunyan';
import { findIndex } from 'lodash';

import { config } from '@root/config';
import { IChatUsers, IMessageData } from '@chat/interfaces/chat.interface';
import { Helpers } from '@globals/helpers/helpers';
import { BaseCache } from '@services/redis/base.cache';
import { ServerError } from '@globals/helpers/error-handler';

const logger: Logger = config.createLogger('messageCache');

export class MessageCache extends BaseCache {
  constructor() {
    super('messageCache');
  }

  public async addChatListToCache(
    senderId: string,
    receiverId: string,
    conversationId: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const userChatList = await this.client.LRANGE(
        `chatList:${senderId}`,
        0,
        -1
      );
      if (userChatList.length) {
        await this.client.RPUSH(
          `chatList:${senderId}`,
          JSON.stringify({ receiverId, conversationId })
        );
      } else {
        const receiverIndex: number = findIndex(
          userChatList,
          (listItem: string) => listItem.includes(receiverId)
        );

        if (receiverIndex < 0) {
          await this.client.RPUSH(
            `chatList:${senderId}`,
            JSON.stringify({ receiverId, conversationId })
          );
        }
      }
    } catch (error) {
      logger.error(error);
      throw new ServerError('Something went wrong. Please try again');
    }
  }
  public async addChatMessagesToCache(
    conversationId: string,
    value: IMessageData
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.RPUSH(
        `messages:${conversationId}`,
        JSON.stringify(value)
      );
    } catch (error) {
      logger.error(error);
      throw new ServerError('Something went wrong. Please try again');
    }
  }

  public async addChatUsersToCache(value: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const users: IChatUsers[] = await this.getChatUsersList();

      const userIndex: number = findIndex(
        users,
        (listItem: IChatUsers) =>
          JSON.stringify(listItem) === JSON.stringify(value)
      );

      let chatUsers: IChatUsers[] = [];

      if(userIndex === -1) {
        await this.client.RPUSH('chatUsers', JSON.stringify(value));
        chatUsers = await this.getChatUsersList();
      } else {
        chatUsers = users;
      }
      return chatUsers;
    } catch (error) {
      logger.error(error);
      throw new ServerError('Something went wrong. Please try again');
    }
  }
  public async removeChatUsersFromCache(value: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const users: IChatUsers[] = await this.getChatUsersList();

      const userIndex: number = findIndex(
        users,
        (listItem: IChatUsers) =>
          JSON.stringify(listItem) === JSON.stringify(value)
      );

      let chatUsers: IChatUsers[] = [];

      if(userIndex > -1) {
        await this.client.LREM('chatUsers', userIndex, JSON.stringify(value));
        chatUsers = await this.getChatUsersList();
      } else {
        chatUsers = users;
      }
      return chatUsers;
    } catch (error) {
      logger.error(error);
      throw new ServerError('Something went wrong. Please try again');
    }
  }

  private async getChatUsersList(): Promise<IChatUsers[]> {
    const chatUsersList: IChatUsers[] = [];
    const chatUsers = await this.client.LRANGE(`chatUsers`, 0, -1);
    for (const item of chatUsers) {
      const chatUser: IChatUsers = Helpers.parseJson(item);
      chatUsersList.push(chatUser);
    }
    return chatUsersList;
  }
}

import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { MessageCache } from '@services/redis/messages.cache';
import { IMessageData } from '@chat/interfaces/chat.interface';
import { chatService } from '../../../shared/services/db/chat.service';
import mongoose from 'mongoose';

const messageCache: MessageCache = new MessageCache();

export class Get {
  public async conversations(req: Request, res: Response): Promise<void> {
    let list: IMessageData[] = [];
    const cachedList = await messageCache.getUserConversationsFromCache(
      `${req.currentUser?.userId}`
    );

    if (cachedList.length) {
      list = cachedList;
    } else {
      list = await chatService.getUserConversationsList(
        new mongoose.Types.ObjectId(req.currentUser?.userId)
      );
    }
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'User conversations fetched successfully', list });
  }
}

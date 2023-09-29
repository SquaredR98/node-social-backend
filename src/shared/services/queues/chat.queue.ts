import { chatWorker } from '@workers/chat.worker';
import { BaseQueue } from '@services/queues/base.queue';
import { IChatJobData, IMessageData } from '@chat/interfaces/chat.interface';

class ChatQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.processJob('addChatMessageToDB', 5, chatWorker.addChatMessageToDB);
  }

  public addChatJob(name: string, data: IChatJobData | IMessageData): void {
    this.addJob(name, data);
  }
}

export const chatQueue: ChatQueue = new ChatQueue();

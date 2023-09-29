import Logger from 'bunyan';
import { config } from '@root/config';
import { DoneCallback, Job } from 'bull';
import { authService } from '@services/db/auth.service';
import { chatService } from '../services/db/chat.service';


const logger: Logger = config.createLogger('CHAT-WORKER');

class ChatWorker {
  async addChatMessageToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await chatService.addMessageToDB(data)
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      logger.error(error);
      done(error as Error);
    }
  }
}

export const chatWorker: ChatWorker = new ChatWorker();
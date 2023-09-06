import Logger from 'bunyan';
import { config } from '@root/config';
import { DoneCallback, Job } from 'bull';
import { notificationService } from '@services/db/notification.service';


const logger: Logger = config.createLogger('AUTH-WORKER');

class NotificationWorker {
  async updateNotification(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key } = job.data;
      await notificationService.updateNotification(key);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      logger.error(error);
      done(error as Error);
    }
  }
  async deleteNotification(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key } = job.data;
      await notificationService.deleteNotification(key);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      logger.error(error);
      done(error as Error);
    }
  }
}

export const notificationWorker: NotificationWorker = new NotificationWorker();
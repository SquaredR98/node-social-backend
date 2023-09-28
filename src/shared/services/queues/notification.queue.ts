import { BaseQueue } from '@services/queues/base.queue';
import { INotificationJobData } from '@notifications/interfaces/notification.interface';
import { notificationWorker } from '@workers/notification.worker';

class NotificationQueue extends BaseQueue {
  constructor() {
    super('notification');
    this.processJob('updateNotification', 5, notificationWorker.updateNotification);
    this.processJob('deleteNotification', 5, notificationWorker.deleteNotification);
  }

  public addNotificationJob(name: string, data: INotificationJobData): void {
    this.addJob(name, data);
  }
}

export const notificationQueue: NotificationQueue = new NotificationQueue();
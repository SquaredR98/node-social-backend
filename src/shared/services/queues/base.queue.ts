import Queue, { Job } from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Logger from 'bunyan';
import { config } from '@root/config';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { IEmailJob } from '@user/interfaces/user.interface';
import { IPostJobData } from '@posts/interfaces/post.interface';
import { IReactionJob } from '@reactions/interfaces/reaction.interface';
import { ICommentJob } from '@comments/interfaces/comment.interface';
import { IFollowerJobData } from '@followers/interfaces/follower.interface';
import { INotificationJobData } from '@notifications/interfaces/notification.interface';
import { IFileImageJobData } from '@images/interfaces/image.interface';

type IBaseJobData =
  | IAuthJob
  | IEmailJob
  | IPostJobData
  | IReactionJob
  | ICommentJob
  | IFollowerJobData
  | INotificationJobData
  | IFileImageJobData;

let bullAdapters: BullAdapter[] = [];

export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
  queue: Queue.Queue;
  logger: Logger;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    bullAdapters.push(new BullAdapter(this.queue));
    bullAdapters = [...new Set(bullAdapters)];
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      queues: bullAdapters,
      serverAdapter
    });

    this.logger = config.createLogger(`${queueName}-Queue`);

    this.queue.on('completed', (job: Job) => {
      this.logger.info('Job: ', job.name, 'Successfully Completed');
      job.remove();
    });

    this.queue.on('global:completed', (jobId: string) => {
      this.logger.info(`Job-${jobId}: Completed`);
    });

    this.queue.on('global:stalled', (jobId: string) => {
      this.logger.info(`Job-${jobId}: Stalled`);
    });
  }

  protected addJob(name: string, data: IBaseJobData): void {
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  }

  protected processJob(
    name: string,
    concurrency: number,
    callback: Queue.ProcessCallbackFunction<void>
  ): void {
    this.queue.process(name, concurrency, callback);
  }
}

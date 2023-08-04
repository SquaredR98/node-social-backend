import { BaseQueue } from '@services/queues/base.queue';
import { ICommentJob } from '@comments/interfaces/comment.interface';
import { commentWorker } from '@workers/comments.worker';

class CommentsQueue extends BaseQueue {
  constructor() {
    super('comments');
    this.processJob('addCommentToDB', 5, commentWorker.addCommentToDB);
  }

  public addCommentsJob(name: string, data: ICommentJob): void {
    this.addJob(name, data);
  }
}

export const commentsQueue: CommentsQueue = new CommentsQueue();
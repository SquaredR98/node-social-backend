import { BaseQueue } from '@services/queues/base.queue';
import { IReactionJob } from '@reactions/interfaces/reaction.interface';
import { reactionWorker } from '../../workers/reaction.worker';

class ReactionQueue extends BaseQueue {
  constructor() {
    super('reactions');
    this.processJob('addReactionToDB', 5, reactionWorker.addReactionToDB);
    this.processJob('removeReactionFromDB', 5, reactionWorker.removeReactionFromDB);
  }

  public addReactionJob (name: string, data: IReactionJob): void {
    this.addJob(name, data);
  }
}

export const reactionQueue: ReactionQueue = new ReactionQueue();
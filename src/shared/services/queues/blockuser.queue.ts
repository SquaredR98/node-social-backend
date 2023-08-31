import { IBlockedUserJobData } from '@followers/interfaces/follower.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { blockUserWorker } from '@workers/blocked.worker';


class BlockUserQueue extends BaseQueue {
  constructor() {
    super('blockedUsers');
    this.processJob('addBlockedUsersToDB', 5, blockUserWorker.addBlockUserToDB);
    this.processJob('removeBlockedUsersFromDB', 5, blockUserWorker.addBlockUserToDB);
  }

  public async addBlockUserJob(name: string, data: IBlockedUserJobData) {
    this.addJob(name, data);
  }
}

export const blockUserQueue: BlockUserQueue = new BlockUserQueue();
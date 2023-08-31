import Logger from 'bunyan';
import { config } from '@root/config';
import { DoneCallback, Job } from 'bull';
import { blockUserService } from '@services/db/block-user.service';


const logger: Logger = config.createLogger('BLOCK-WORKER');

class BlockUserWorker {
  async addBlockUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, type } = job.data;
      if(type === 'block') {
        await blockUserService.blockUser(keyOne, keyTwo);
      } else {
        await blockUserService.unBlockUser(keyOne, keyTwo);
      }
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      logger.error(error);
      done(error as Error);
    }
  }
}

export const blockUserWorker: BlockUserWorker = new BlockUserWorker();
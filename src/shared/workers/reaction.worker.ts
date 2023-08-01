import Logger from 'bunyan';
import { config } from '@root/config';
import { DoneCallback, Job } from 'bull';
import { reactionService } from '../services/db/reaction.service';


const logger: Logger = config.createLogger('REACTION-WORKER');

class ReactionWorker {
  async addReactionToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await reactionService.addReactionToDB(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      logger.error(error);
      done(error as Error);
    }
  }

  async removeReactionFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await reactionService.removeReactionDataFromDB(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      logger.error(error);
      done(error as Error);
    }
  }
}

export const reactionWorker: ReactionWorker = new ReactionWorker();
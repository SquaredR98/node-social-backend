import mongoose from 'mongoose';
import Logger from 'bunyan';
import { config } from '@root/config';
import { redisConnection } from './shared/services/redis/redis.connection';

const logger: Logger = config.createLogger('DATABASE-SETUP');

export default () => {
  const connect = () => {
    mongoose
      .connect(
        `${config.DATABASE_URI!}/${
          config.NODE_ENV !== 'production' ? config.NODE_ENV : 'production-db'
        }`,
        {}
      )
      .then(() => {
        logger.info('Succesfully connected to DB...');
        redisConnection.connect();
      })
      .catch((error) => {
        logger.error('Error connecting to DB...', error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};

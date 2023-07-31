import { Application } from 'express';
import { authRoutes } from '@auth/routes/authRoutes';
import { serverAdapter } from '@services/queues/base.queue';
import { currentUserRoute } from '@auth/routes/currentRoutes';
import { authMiddleware } from '@globals/helpers/auth-middleware';
import { postRoute } from '@post/routes/postRoutes';
import { reactionRoutes } from './features/reactions/routes/reactionRoutes';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signOutRoutes());
    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes());
    return;
  };
  routes();
};

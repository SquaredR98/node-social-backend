import { Application } from 'express';
import { authRoutes } from '@auth/routes/authRoutes';
import { serverAdapter } from '@services/queues/base.queue';
import { currentUserRoute } from '@auth/routes/currentRoutes';
import { authMiddleware } from '@globals/helpers/auth-middleware';
import { postRoute } from '@posts/routes/postRoutes';
import { reactionRoutes } from '@reactions/routes/reactionRoutes';
import { commentRoutes } from '@comments/routes/commentsRoute';
import { followRoutes } from '@followers/routes/followRoutes';
import { notificationRoutes } from '@notifications/routes/notificationRoutes';
import { imageRoutes } from '@images/routes/imageRoutes';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signOutRoutes());
    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, followRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, notificationRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, imageRoutes.routes());
    return;
  };
  routes();
};

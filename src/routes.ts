import { Application } from 'express';
import { authRoutes } from '@auth/routes/authRoutes';
import { chatRoutes } from '@chat/routes/chatRoutes';
import { postRoute } from '@posts/routes/postRoutes';
import { imageRoutes } from '@images/routes/imageRoutes';
import { serverAdapter } from '@services/queues/base.queue';
import { currentUserRoute } from '@auth/routes/currentRoutes';
import { followRoutes } from '@followers/routes/followRoutes';
import { commentRoutes } from '@comments/routes/commentsRoute';
import { authMiddleware } from '@globals/helpers/auth-middleware';
import { reactionRoutes } from '@reactions/routes/reactionRoutes';
import { notificationRoutes } from '@notifications/routes/notificationRoutes';

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
    app.use(BASE_PATH, authMiddleware.verifyUser, chatRoutes.routes());
    return;
  };
  routes();
};

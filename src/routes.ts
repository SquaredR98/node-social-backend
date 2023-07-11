import { Application } from 'express';
import { authRoutes } from '@auth/routes/authRoutes';
import { serverAdapter } from '@services/queues/base.queue';
import { currentUserRoute } from './features/auth/routes/currentRoutes';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signOutRoutes());
    app.use(BASE_PATH, currentUserRoute.routes());
    return;
  };
  routes();
};

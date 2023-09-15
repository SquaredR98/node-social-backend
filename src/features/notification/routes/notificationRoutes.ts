import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/auth-middleware';

import { Get } from '@notification/controllers/get-notification';
import { Update } from '@notification/controllers/update-notification';
import { Delete } from '@notification/controllers/delete-notification';

class NotificationRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get(
      '/notifications',
      authMiddleware.checkAuthentication,
      Get.prototype.notification
    );
    this.router.put(
      '/notification/:notificationId',
      authMiddleware.checkAuthentication,
      Update.prototype.notification
    );
    this.router.delete(
      '/notification/:notificationId',
      authMiddleware.checkAuthentication,
      Delete.prototype.notification
    );

    return this.router;
  }
}

export const notificationRoutes: NotificationRoutes = new NotificationRoutes();

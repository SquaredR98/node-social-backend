import express, { Router } from 'express';

import { Add } from '@images/controllers/add-image';
import { Get } from '@images/controllers/get-images';
import { Delete } from '@images/controllers/delete-image';
import { authMiddleware } from '@globals/helpers/auth-middleware';

class ImageRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get(
      '/images/userId',
      authMiddleware.checkAuthentication,
      Get.prototype.images
    );
    this.router.post(
      '/images/upload/profile-image',
      authMiddleware.checkAuthentication,
      Add.prototype.profileImage
    );
    this.router.post(
      '/images/upload/bg-image',
      authMiddleware.checkAuthentication,
      Add.prototype.backgroundImage
    );
    this.router.delete(
      '/images/:imageId',
      authMiddleware.checkAuthentication,
      Delete.prototype.image
    );
    this.router.delete(
      '/images/background/:bgImageId',
      authMiddleware.checkAuthentication,
      Delete.prototype.backgroundImage
    );

    return this.router;
  }
}

export const imageRoutes: ImageRoutes = new ImageRoutes();

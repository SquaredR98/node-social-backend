import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/auth-middleware';
import { Create } from '@post/controllers/create-post';
import { Get } from '@post/controllers/get-posts';
import { Delete } from '@post/controllers/delete-post';


class PostRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/post/all/:page', authMiddleware.checkAuthentication, Get.prototype.posts);
    this.router.get('/post/images/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithImages);

    this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post);
    this.router.post('/post/image', authMiddleware.checkAuthentication, Create.prototype.postWithImage);

    this.router.delete('/post/:postId', authMiddleware.checkAuthentication, Delete.prototype.post);

    return this.router;
  }
}

export const postRoute: PostRoutes = new PostRoutes();
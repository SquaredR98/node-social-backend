import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/auth-middleware';
import { Add } from '@comments/controllers/add-comments';
import { Get } from '../controllers/get-comments';


class CommentRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/post/comment/:postId', authMiddleware.checkAuthentication, Get.prototype.comments);
    this.router.get('/post/comment-names/:postId', authMiddleware.checkAuthentication, Get.prototype.commentNames);
    this.router.get('/post/single-comment/:postId/:commentId', authMiddleware.checkAuthentication, Get.prototype.singleComment);

    this.router.post('/post/comment', authMiddleware.checkAuthentication, Add.prototype.comment);
    return this.router;
  }
}

export const commentRoutes: CommentRoutes = new CommentRoutes();
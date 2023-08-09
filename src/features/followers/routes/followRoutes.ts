import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/auth-middleware';
import { Add } from '@followers/controllers/follow-user';
import { Remove } from '@followers/controllers/unfollow-user';

class FollowRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, Add.prototype.follower);
    this.router.put('/user/unfollow/:followeeId/:followerId', authMiddleware.checkAuthentication, Remove.prototype.follower);

    return this.router;
  }
}

export const followRoutes: FollowRoutes = new FollowRoutes();
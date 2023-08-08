import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/auth-middleware';
import { Add } from '@followers/controllers/follow-user';

class FollowRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, Add.prototype.follower);

    return this.router;
  }
}

export const followRoutes: FollowRoutes = new FollowRoutes();

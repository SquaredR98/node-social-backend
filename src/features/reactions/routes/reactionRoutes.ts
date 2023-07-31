import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/auth-middleware';
import { Reactions } from '@reactions/controllers/add-reactions';


class ReactionRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/post/reaction', authMiddleware.checkAuthentication, Reactions.prototype.add);

    return this.router;
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();
import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/auth-middleware';
import { Add } from '@reactions/controllers/add-reactions';
import { Remove } from '@reactions/controllers/remove-reaction';


class ReactionRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/post/reaction', authMiddleware.checkAuthentication, Add.prototype.reaction);
    this.router.delete('/post/reaction/:postId/:previousReaction/:postReactions', authMiddleware.checkAuthentication, Remove.prototype.reaction);

    return this.router;
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();
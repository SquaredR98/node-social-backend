import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/auth-middleware';
import { Add } from '@reactions/controllers/add-reactions';
import { Remove } from '@reactions/controllers/remove-reaction';
import { Get } from '@reactions/controllers/get-reactions';

class ReactionRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get(
      '/post/reaction/:postId',
      authMiddleware.checkAuthentication,
      Get.prototype.reactions
    );
    this.router.get(
      '/post/reaction/:postId/:username',
      authMiddleware.checkAuthentication,
      Get.prototype.singleReactionByUsername
    );
    this.router.get(
      '/post/reaction-by-username/:username',
      authMiddleware.checkAuthentication,
      Get.prototype.reactionsByUsername
    );
    this.router.post('/post/reaction', authMiddleware.checkAuthentication, Add.prototype.reaction);
    this.router.delete(
      '/post/reaction/:postId/:previousReaction/:postReactions',
      authMiddleware.checkAuthentication,
      Remove.prototype.reaction
    );

    return this.router;
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();

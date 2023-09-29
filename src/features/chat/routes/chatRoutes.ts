import express, { Router } from 'express';
import { Add } from '@chat/controllers/add-chat-messages';
import { authMiddleware } from '../../../shared/globals/helpers/auth-middleware';


class ChatRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/chat/message', authMiddleware.checkAuthentication, Add.prototype.message);

    return this.router;
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();
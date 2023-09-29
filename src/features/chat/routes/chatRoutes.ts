import express, { Router } from 'express';
import { Add } from '@chat/controllers/add-chat-messages';
import { Get } from '@chat/controllers/get-chat-messages';
import { authMiddleware } from '@globals/helpers/auth-middleware';

class ChatRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get(
      '/chat/conversations',
      authMiddleware.checkAuthentication,
      Get.prototype.conversations
    );
    this.router.post(
      '/chat/message',
      authMiddleware.checkAuthentication,
      Add.prototype.message
    );
    this.router.post(
      '/chat/add-chat-users',
      authMiddleware.checkAuthentication,
      Add.prototype.addChatUsers
    );
    this.router.delete(
      '/chat/remove-chat-users',
      authMiddleware.checkAuthentication,
      Add.prototype.removeChatUsers
    );

    return this.router;
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();

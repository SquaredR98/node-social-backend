import express, { Router } from 'express';
import { CurrentUser } from '../controllers/current-user';
import { authMiddleware } from '../../../shared/globals/helpers/auth-middleware';


class CurrentUserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/current-user', authMiddleware.checkAuthentication, CurrentUser.prototype.read);

    return this.router;
  }
}

export const currentUserRoute: CurrentUserRoutes = new CurrentUserRoutes();
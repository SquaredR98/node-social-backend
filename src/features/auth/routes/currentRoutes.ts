import express, { Router } from 'express';
import { CurrentUser } from '../controllers/current-user';


class CurrentUserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/current-user', CurrentUser.prototype.read);

    return this.router;
  }
}

export const currentUserRoute: CurrentUserRoutes = new CurrentUserRoutes();
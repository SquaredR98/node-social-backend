import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { NotAuthorizedError } from './error-handler';
import { AuthPayload } from '../../../features/auth/interfaces/auth.interface';
import { config } from '../../../config';

class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) throw new NotAuthorizedError('Token missing. Please login again');

    try {
      const payload: AuthPayload = jwt.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError('Token is invalid. Please login again');
    }

    next();
  }

  public checkAuthentication(req: Request, res: Response, next: NextFunction) {
    if (!req.currentUser) throw new NotAuthorizedError('Unauthorized access. Please login.');
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();

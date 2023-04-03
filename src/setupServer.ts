import {
  Application,
  json,
  urlencoded,
  Response,
  Request,
  NextFunction,
} from "express";

import { Server } from "http";

export class BackendServer {
  private app: Application;

  /**
   *
   * @param app <Application>
   *
   * Initializes the server instance to app parameter
   * passed to the constructor.
   */
  constructor(app: Application) {
    this.app = app;
  }

  /**
   *
   * @param null <void>
   *
   * Every private method will be called here and also
   * will contain all other methods needed to start
   * the current node application.
   */
  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  /**
   *
   * @param app <Application>
   *
   * This will contain initialization of all the security
   * middleware to be used in the main app.
   */
  private securityMiddleware(app: Application): void {

  }

  /**
   *
   * @param app
   *
   * This will contain all the standard middlewares.
   */
  private standardMiddleware(app: Application): void {}

  /**
   *
   * @param app
   *
   * It will contain all the routes related middleware.
   */
  private routesMiddleware(app: Application): void {}

  /**
   *
   * @param app
   *
   * It will contain all the global error handler.
   */
  private globalErrorHandler(app: Application): void {}

  /**
   *
   * @param app
   *
   * This method is going to start the httpServer
   */
  private startServer(app: Application): void {}

  /**
   * 
   * @param httpServer 
   * 
   * Method to create an instance of SocketIO
   */
  private createSocketIO(httpServer: Server): void {}

  private startHttpServer(httpServer: Server): void {}
}

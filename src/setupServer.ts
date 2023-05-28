import {
  Application,
  json,
  urlencoded,
  Response,
  Request,
  NextFunction,
} from "express";

import http from "http";

import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import cookieSession from "cookie-session";
import HTTP_STATUS from "http-status-codes";
import "express-async-errors";
import compression from "compression";
import { config } from "./config";

const SERVER_PORT = 5000;

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
    app.use(
      cookieSession({
        name: "backend-user-session",
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== 'development',
      })
    );

    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: "*",
        credentials: true, // Setting this is mandatory in order to use cookie
        optionsSuccessStatus: 200,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      })
    );
  }

  /**
   *
   * @param app
   *
   * This will contain all the standard middlewares.
   */
  private standardMiddleware(app: Application): void {
    // Help compress our request and response
    app.use(compression());
    app.use(json({ limit: "50mb" }));
    app.use(urlencoded({ extended: true, limit: "50mb" }));
  }

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
  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.startHttpServer(httpServer);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   *
   * @param httpServer
   *
   * Method to create an instance of SocketIO
   */
  private createSocketIO(httpServer: http.Server): void {}

  private startHttpServer(httpServer: http.Server): void {
    httpServer.listen(SERVER_PORT, () => {
      console.log('Server is listening on port:', SERVER_PORT);
    })
  }
}

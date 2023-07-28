/**
 * Basic Libraries
 */
import {
  Application,
  json,
  urlencoded,
  Response,
  Request,
  NextFunction
} from 'express';
import hpp from 'hpp';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import Logger from 'bunyan';
import 'express-async-errors';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import compression from 'compression';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import { createAdapter } from '@socket.io/redis-adapter';

/**
 * Custom Files created
 */
import { config } from '@root/config';
import applicationRoutes from '@root/routes';
import { CustomError, IErrorResponse } from '@globals/helpers/error-handler';
import { SocketIoPostHandler } from './shared/sockets/post';

const SERVER_PORT = 5000;
const logger: Logger = config.createLogger('ServerSetup');

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
        name: 'backend-user-session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== 'development'
      })
    );

    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: '*',
        credentials: true, // Setting this is mandatory in order to use cookie
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
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
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  /**
   *
   * @param app
   *
   * It will contain all the routes related middleware.
   */
  private routesMiddleware(app: Application): void {
    applicationRoutes(app);
  }

  /**
   *
   * @param app
   *
   * It will throw error when a request is made to endpoint not available.
   */
  private globalErrorHandler(app: Application): void {
    app.all('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: `${req.originalUrl} not found.`
      });
    });

    app.use(
      (
        error: IErrorResponse,
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        logger.error(error);
        if (error instanceof CustomError) {
          return res.status(error.statusCode).json(error.serializeErrors());
        }
        next();
      }
    );
  }

  /**
   *
   * @param app
   *
   * This method is going to start the httpServer
   */
  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const SocketIO: Server = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.sockeIOConnection(SocketIO);
    } catch (error) {
      logger.error(error);
    }
  }

  /**
   *
   * @param httpServer
   *
   * Method to create an instance of SocketIO
   */
  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });

    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    return io.adapter(createAdapter(pubClient, subClient));
  }

  private startHttpServer(httpServer: http.Server): void {
    logger.info(`Server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      logger.info('Server is listening on port:', SERVER_PORT);
    });
  }

  private sockeIOConnection(io: Server): void {
    const postSocketHandler: SocketIoPostHandler = new SocketIoPostHandler(io);

    postSocketHandler.listen();
  }
}


// Testing the CI workflow trigger
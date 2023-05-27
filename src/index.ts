import express, { Express } from "express";
import { BackendServer } from "./setupServer";
import databaseConnection from './setupDatabase';

class Application {
  /**
   * Function to initialize the Exxpress Server
   */
  public initialize(): void {
    databaseConnection();
    const app: Express = express();
    const server: BackendServer = new BackendServer(app);
    server.start();
  }
}

const application: Application = new Application();
application.initialize();

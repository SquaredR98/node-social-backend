import express, { Express } from "express";

import { BackendServer } from "./setupServer";

class Application {
  /**
   * Function to initialize the Exxpress Server
   */
  public initialize(): void {
    const app: Express = express();
    const server: BackendServer = new BackendServer(app);
    server.start();
  }
}

const application: Application = new Application();
application.initialize();

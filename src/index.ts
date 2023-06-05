import express, { Express } from 'express';
import { BackendServer } from './setupServer';
import databaseConnection from './setupDatabase';
import { config } from './config';

class Application {
    /**
     * Function to initialize the Exxpress Server
     */
    public initialize(): void {
        this.loadConfig();
        databaseConnection();
        const app: Express = express();
        const server: BackendServer = new BackendServer(app);
        server.start();
    }

    private loadConfig(): void {
        config.validateConfig();
    }
}

const application: Application = new Application();
application.initialize();

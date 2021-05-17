import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import useragent from 'express-useragent';
import http from 'http';
import socketIO from 'socket.io';
import { ServerEventSystem } from './server-events';

import { Controller } from './controllers';

import { SERVICE_NAME, STATIC_DIR } from './config';

class App {
    public app: any;
    public port: number;

    constructor(controllers: Controller[], port: number, middlewares: any[]) {
        this.app = express();
        this.port = port;

        this.initializeControllers(controllers);
        this.initializeMiddlewares(middlewares);
    }

    private initializeMiddlewares(middlewares: any[]) {
        this.app.disable('x-powered-by');
        this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(cors());
        this.app.use(useragent.express());

        this.app.use('/static', express.static(STATIC_DIR));

        middlewares.forEach((m) => this.app.use(m));

        this.app = http.createServer(this.app);
        const socketIOServer = (socketIO as any)(this.app);

        ServerEventSystem.initialize(socketIOServer);
    }

    public applyExternalMiddleware(middleware: any) {
        this.app.use(middleware);
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use(controller.path, controller.router);
        });
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`[${SERVICE_NAME}] listening on the port ${this.port}`);
        });
    }
}

export { App };

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import useragent from 'express-useragent';
import http from 'http';
import socketIoInit from 'socket.io';
// import { ServerEventSystem } from './server-events';

import { Controller } from './controllers';

import { SERVICE_NAME, STATIC_DIR } from './config';

class App {
    public app: any;
    public server: any;
    public port: number;
    public io: any;

    constructor(controllers: Controller[], port: number, middlewares: any[]) {
        this.app = express();
        this.port = port;

        this.initializeMiddlewares(middlewares);
        this.initializeControllers(controllers);
    }

    private initializeMiddlewares(middlewares: any[]) {
        this.app.disable('x-powered-by');
        this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(cors());
        this.app.use(useragent.express());

        this.app.use('/static', express.static(STATIC_DIR));

        middlewares.forEach((m) => this.app.use(m));
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
        this.server = http.createServer(this.app);
        // this.server.listen(this.port);
        // this.server.on('error', () => {
        //     console.log('Err');
        // });
        // this.server.on('listening', () => {
        //     console.log(`[${SERVICE_NAME}] listening on the port ${this.port}`);
        // });
        this.io = require('socket.io')(this.server, {
            cors: {
                origin: '*',
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                preflightContinue: false,
                optionsSuccessStatus: 204,
            },
        });

        // ServerEventSystem.initialize(io);

        this.server.listen(this.port, () => {
            console.log(`[${SERVICE_NAME}] listening on the port ${this.port}`);
        });
    }
}

export { App };

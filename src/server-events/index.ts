import _ from 'lodash';
import { injectable, inject } from 'inversify';

import { EventTypes } from './event-types';
// import { verifyJWTToken } from "../services/auth.service";
import ClientUser from './client-user';
import TrackingUser from './tracking-user';
import { AuthService } from '../services/auth.service';
import { Request, Response, ServiceType } from '../types';

// let socketIOServer = null;
// let connectedUser = [] as any;
// let tracking = new TrackingUser();

// let clientSockets: any = [];

@injectable()
export class SocketService {
    private socketIOServer: any;
    private connectedUser = [] as any;
    private tracking: TrackingUser;
    private clientSockets: any;

    constructor(@inject(ServiceType.Auth) private authService: AuthService) {
        console.log('[SOCKET IO Service] Construct');

        this.socketIOServer = null;
        this.connectedUser = [] as any;
        this.tracking = new TrackingUser();

        this.clientSockets = [];
    }

    notifyUser = (receiveUserId: any, data: any) => {
        console.log('Noti');
        this.connectedUser.map((e: any) => {
            e.notifyClient('Hello World');
        });

        // if (_.has(connectedUser, receiveUserId)) {
        //     console.log('User receive nofti: ', receiveUserId);
        //     connectedUser[receiveUserId].notifyClient(data);
        // }
    };

    onConnection = (socket: any) => {
        console.log('New user connected');

        // Thanh's code: store all client sockets connection in an array
        this.clientSockets.push(socket);

        // // A new user setup a socket connection with server
        // this.connectedUser[socket.id] = new ClientUser(socket.id);
        // this.connectedUser[socket.id].registerSocket(socket);

        // // Update tracking service: a new socket from a user
        // this.tracking.addUserConnecting(socket.id, socket.id);

        // Authenticate user with token
        socket.on(EventTypes.AUTHENTICATE, async (userId: any) => {
            console.log('Has a new connection', socket.id);
            console.log('Connected User', this.connectedUser);
            try {
                // Authenticate success

                // const { _id: userId } = decodedToken;

                // Create a user if not connect, else register new socket
                if (!_.has(this.connectedUser, userId)) {
                    this.connectedUser[userId] = new ClientUser(userId);
                }
                this.connectedUser[userId].registerSocket(socket);

                this.tracking.addUserConnecting(socket.id, userId);

                socket.emit(EventTypes.AUTHENTICATE, { success: true });
            } catch (err) {
                const errMessage =
                    'Invalid token, disconnect NOW - ' + socket.id;
                console.log(errMessage);
                console.log(err);
                socket.emit(EventTypes.AUTHENTICATE, { error: errMessage });
                setTimeout(() => socket.disconnect(true), 5000);
            }
        });

        socket.on(EventTypes.DISCONNECT, () => {
            this.tracking.removeUserConnecting(socket.id);
        });
    };

    // Emit 'notify' event to all clients
    notifyUpdate = (data: any) => {
        Object.keys(this.connectedUser).map((key: any, index: any) => {
            this.connectedUser[key].notifyClient(data);
        });

        // _.forEach(this.clientSockets, (socket) => {
        //     // console.log(socket);
        //     socket.emit(EventTypes.NOTIFY, data);
        // });
    };

    initialize = (socketServer: any) => {
        this.socketIOServer = socketServer;

        this.socketIOServer.on('connection', this.onConnection);
    };
}

// export const ServerEventSystem = {
//     initialize,
//     notifyUser,
//     notifyUpdate,
//     tracking,
// };

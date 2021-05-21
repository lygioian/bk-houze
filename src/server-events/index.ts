import _ from 'lodash';

import { EventTypes } from './event-types';
// import { verifyJWTToken } from "../services/auth.service";
import ClientUser from './client-user';
import TrackingUser from './tracking-user';

let socketIOServer = null;
let connectedUser = [] as any;
let tracking = new TrackingUser();

let clientSockets: any = [];

function notifyUser(receiveUserId: any, data: any) {
    console.log('Noti');
    connectedUser.map((e: any) => {
        e.notifyClient('Hello World');
    });

    // if (_.has(connectedUser, receiveUserId)) {
    //     console.log('User receive nofti: ', receiveUserId);
    //     connectedUser[receiveUserId].notifyClient(data);
    // }
}

function onConnection(socket: any) {
    console.log('New user connected');

    // Thanh's code: store all client sockets connection in an array
    clientSockets.push(socket);
    
    // A new user setup a socket connection with server
    connectedUser[socket.id] = new ClientUser(socket.id);
    connectedUser[socket.id].registerSocket(socket);

    // Update tracking service: a new socket from a user
    tracking.addUserConnecting(socket.id, socket.id);

    // Authenticate user with token
    socket.on(EventTypes.AUTHENTICATE, async (token: any) => {
        console.log('Has a new connection', socket.id);
        console.log('Connected User', connectedUser);
        try {
            // Authenticate success
            const decodedToken = await token;
            const { _id: userId } = decodedToken.data;

            // Create a user if not connect, else register new socket
            if (!_.has(connectedUser, userId)) {
                connectedUser[userId] = new ClientUser(userId);
            }
            connectedUser[userId].registerSocket(socket);

            tracking.addUserConnecting(socket.id, userId);

            socket.emit(EventTypes.AUTHENTICATE, { success: true });
        } catch (err) {
            const errMessage = 'Invalid token, disconnect NOW - ' + socket.id;
            console.log(errMessage);
            console.log(err);
            socket.emit(EventTypes.AUTHENTICATE, { error: errMessage });
            setTimeout(() => socket.disconnect(true), 5000);
        }
    });

    socket.on(EventTypes.DISCONNECT, () => {
        tracking.removeUserConnecting(socket.id);
    });
}

// Emit 'notify' event to all clients
function notifyUpdate(data: any) {
    _.forEach(clientSockets, (socket) => {
        socket.emit(EventTypes.NOTIFY, data);
    });
}

function initialize(socketServer: any) {
    socketIOServer = socketServer;

    socketIOServer.on('connection', onConnection);
}

export const ServerEventSystem = {
    initialize,
    notifyUser,
    notifyUpdate,
    tracking,
};

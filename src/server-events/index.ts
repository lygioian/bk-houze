import _ from 'lodash';

import { EventTypes } from './event-types';
// import { verifyJWTToken } from "../services/auth.service";
import ClientUser from './client-user';
import TrackingUser from './tracking-user';

let socketIOServer = null;
let connectedUser = [] as any;
let tracking = new TrackingUser();

function notifyUser(receiveUserId: any, data: any) {
    if (_.has(connectedUser, receiveUserId)) {
        console.log('User receive nofti: ', receiveUserId);
        connectedUser[receiveUserId].notifyClient(data);
    }
}

function onConnection(socket: any) {
    socket.on(EventTypes.AUTHENTICATE, async (token: any) => {
        console.log('Has a new connection', socket.id);
        console.log('Connected User', connectedUser);
        try {
            // Authenticate success
            const decodedToken = await token;
            const { _id: userId } = decodedToken.data;

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

function initialize(socketServer: any) {
    socketIOServer = socketServer;

    socketIOServer.on('connection', onConnection);
}

export const ServerEventSystem = {
    initialize,
    notifyUser,
    tracking,
};

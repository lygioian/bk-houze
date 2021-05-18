import { injectable, inject } from 'inversify';
import { Collection, ObjectID, ObjectId } from 'mongodb';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import moment from 'moment';

import { DatabaseService } from './database.service';
import { ServiceType } from '../types';
import { UserService } from './user.service';
import { ErrorRoomInvalid, ErrorUserInvalid } from '../lib/errors';
import { lazyInject } from '../container'
import {
    Room,
    fillDefaultRoomValue,
} from '../models/room.model';
import {
    Device,
    fillDefaultDeviceValue,
} from '../models/device.model'
import {
    HASH_ROUNDS,
    SocialAccountType,
    VERIRY_CODE_TTL,
    VERIFY_CODE_LENGTH,
    EMAIL_SENDER,
} from '../config';
@injectable()
export class RoomService {
    private roomCollection: Collection;
    private deviceCollection: Collection;
    constructor(
        @inject(ServiceType.Database) private dbService: DatabaseService,
    ) {
        console.log('[Room service] Construct');
        this.roomCollection = this.dbService.db.collection('rooms');
        this.deviceCollection = this.dbService.db.collection('devices');
    }

    async create(room: any): Promise<Room> {
        if (_.isEmpty(room.name)){
            throw new ErrorUserInvalid('Missing input fields');
        }
        const addedRoom = await this.roomCollection.insertOne(
            fillDefaultRoomValue(room as Room),
        );

        return addedRoom.ops[0] as Room;
    }

    async update(roomId: ObjectID, data: any){
        const opUpdateResult = await this.roomCollection.updateOne({ _id: roomId }, { $set: data});
        return opUpdateResult.result.nModified;
    }
    async validateRoom(roomId: ObjectID, userId: ObjectID){
        const room = await this.roomCollection.findOne({_id: roomId, createdBy: userId});
        console.log(room);
        if (_.isEmpty(room)) throw new ErrorRoomInvalid('Room not found');
        return true;
    }

    async delete(roomId: ObjectID){
        return this.update(roomId, { isDeleted: true });
    }


    async find(query: any = {}){
        const rooms = await this.roomCollection.find({ "isDeleted" : false}).toArray();
        return rooms.map((room) => _.omit(room))
    }

    async findOne(query: any = {}, keepAll = false): Promise<Room> {
        const room = ( await this.roomCollection.findOne(query)) as Room;
        if (_.isEmpty(room)) throw new ErrorRoomInvalid('Room not found');
        return keepAll ? room : (_.omit(room) as Room);
    }

    async addDevice(roomId: ObjectID, position: number = - 1){
        const opDeviceInsertResult = await this.deviceCollection.insertOne(
            fillDefaultDeviceValue( { room: roomId } as Device),
        )
        const insertedDevice = opDeviceInsertResult.ops[0] as Device;
        const affectedRoom = await this.roomCollection.updateOne(
            { _id: roomId},
            {
                $push: {
                    devices: {
                        $each: [insertedDevice._id],
                        ...(position >= 0 && { $position: position}),
                    },
                },
            },
        );
        if (affectedRoom.modifiedCount == 0)  throw new Error('Unable to add device to this room');
        return { ... insertedDevice};
    }

    async updateDevice(deviceId: ObjectID, data: any){
        const opUpdateResult = await this.deviceCollection.updateOne({ _id: deviceId }, {$set: data});
        return opUpdateResult.result.nModified;
    }

    async deleteRoutine(roomId: ObjectID, deviceId: ObjectID){
        const deletedCount = await this.updateDevice(deviceId, { isDeleted: true});
        if (deletedCount == 0) throw new Error('Unable to delete device');
        const opResult = await this.deviceCollection.updateOne(
            { _id: roomId},
            {
                $pull: { devices: deviceId},
            },
        );
        if (opResult.result.nModified == 0) throw new Error('Unable to delete device in the room');
        return opResult.result.nModified;
    }
}
import { injectable, inject } from 'inversify';
import { Collection, ObjectID } from 'mongodb';
import _ from 'lodash';

import { DatabaseService } from './database.service';
import { UserService } from './user.service';
import { ServiceType } from '../types';
import { ErrorDeviceInvalid } from '../lib/errors';
import { lazyInject } from '../container';

import {
    Device,
    fillDefaultDeviceValue
} from '../models/device.model';

@injectable()
export class DeviceService {
    private deviceCollection: Collection;

    @lazyInject(ServiceType.User) private userService: UserService;

    constructor(
        @inject(ServiceType.Database) private dbService: DatabaseService,
    ) {
        console.log('[Device service] Construct');
        this.deviceCollection = this.dbService.db.collection('devices');
    }

    async create(device: any): Promise<Device> {
        if (device.id == null || _.isEmpty(device.name)) {
            throw new ErrorDeviceInvalid('Missing input fields');
        }
        const addedDevice = await this.deviceCollection.insertOne(
            fillDefaultDeviceValue(device as Device),
        );
        return addedDevice.ops[0] as Device;
    }

    async update(deviceId: ObjectID, data: any) {
        const opUpdateResult = await this.deviceCollection.updateOne(
            { _id: deviceId },
            { $set: data }
        );
        return opUpdateResult.result.nModified;
    }

    async validate(entryId: ObjectID, deviceId: string) {
        const device = await this.deviceCollection.findOne(
            { 
                _id: entryId,
                id: deviceId,
            }
        );
        if (_.isEmpty(device)) throw new ErrorDeviceInvalid('Device not found');

        return true;
    }

    async delete(deviceId: ObjectID) {
        return this.update(deviceId, { isDeleted: true });
    }

    async find(query: any = {}) {
        const devices = await this.deviceCollection.find({"isDeleted": false}).toArray();
        return devices.map((device) => _.omit(device));
    }

    async findOne(query: any = {}, keepAll = false): Promise<Device> {
        const device = (await this.deviceCollection.findOne(query)) as Device;

        if (_.isEmpty(device)) throw new ErrorDeviceInvalid('Device not found');
        return keepAll ? device : (_.omit(device) as Device);
    }
}
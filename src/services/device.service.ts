import { injectable, inject } from 'inversify';
import { Collection, ObjectID } from 'mongodb';
import _ from 'lodash';

import { DatabaseService } from './database.service';
import { ServiceType } from '../types';
import { ErrorDeviceInvalid } from '../lib/errors';
import { lazyInject } from '../container';
import { SupportedDevices, getDeviceName } from '../config';

import {
    Device,
    fillDefaultDeviceValue
} from '../models/device.model';

@injectable()
export class DeviceService {
    private deviceCollection: Collection;

    constructor(
        @inject(ServiceType.Database) private dbService: DatabaseService,
    ) {
        console.log('[Device service] Construct');
        this.deviceCollection = this.dbService.db.collection('devices');
    }

    async create(device: any): Promise<Device> {
        if (device.id === null || _.isEmpty(device.name)) {
            throw new ErrorDeviceInvalid('Missing input fields');
        }
        const names = SupportedDevices.map((device) => getDeviceName(device));
        if (!names.includes(device.name))
            throw new ErrorDeviceInvalid("Invalid device type");

        const addedDevice = await this.deviceCollection.insertOne(
            fillDefaultDeviceValue(device as Device),
        );
        return addedDevice.ops[0] as Device;
    }

    async getNewDeviceId(deviceName: string) {
        const devices: Device[] = await this.find({ name: deviceName });
        const maxId = _.maxBy(devices, 'id').id;
        return maxId + 1;
    }

    async update(deviceId: ObjectID, data: any) {
        const opUpdateResult = await this.deviceCollection.updateOne(
            { 
                _id: deviceId,
            },
            { $set: data }
        );
        return opUpdateResult.result.nModified;
    }

    async validate(deviceId: ObjectID) {
        const device = await this.deviceCollection.findOne(
            { 
                _id: deviceId,
            }
        );
        if (_.isEmpty(device)) throw new ErrorDeviceInvalid('Device not found');
        return true;
    }

    async delete(deviceId: ObjectID) {
        return this.update(deviceId, { isDeleted: true });
    }

    async find(query: any = {}): Promise<Device[]> {
        const devices = await this.deviceCollection.find(query).toArray();
        return devices;
    }

    async findOne(query: any = {}, keepAll = false): Promise<Device> {
        const device = (await this.deviceCollection.findOne(query)) as Device;

        if (_.isEmpty(device)) throw new ErrorDeviceInvalid('Device not found');
        return keepAll ? device : (_.omit(device) as Device);
    }

    async findOneOrCreate(query: any={}, keepAll=false): Promise<Device> {
        const device = (await this.deviceCollection.findOne(query)) as Device;
        if (_.isEmpty(device)) {
            return this.create(query);
        }
        return device;
    }
}
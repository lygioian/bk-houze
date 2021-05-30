import { injectable, inject } from 'inversify';
import { Collection, ObjectID } from 'mongodb';
import _ from 'lodash';

import { DatabaseService } from './database.service';
import { ServiceType } from '../types';
import { ErrorDeviceStatusInvalid } from '../lib/errors';
import { lazyInject } from '../container';

import {
    DeviceStatus,
    fillDefaultDeviceStatusValue
} from '../models/device_status.model';


@injectable()
export class DeviceStatusService {
    private deviceStatusCollection: Collection;

    constructor(
        @inject(ServiceType.Database) private dbService: DatabaseService,
    ) {
        console.log('[Device status service] Construct');
        this.deviceStatusCollection = this.dbService.db.collection('device_status');
    }

    async create(status: any): Promise<DeviceStatus> {
        if (status.deviceId == null) {
            throw new ErrorDeviceStatusInvalid('Missing input fields');
        }

        const addedDeviceStatus = await this.deviceStatusCollection.insertOne(
            fillDefaultDeviceStatusValue(status as DeviceStatus),
        );
        return addedDeviceStatus.ops[0] as DeviceStatus;
    }

    async update(statusId: ObjectID, data: any) {
        const opUpdateResult = await this.deviceStatusCollection.updateOne(
            { 
                _id: statusId,
            },
            { $set: data }
        );
        return opUpdateResult.result.nModified;
    }

    async validate(statusId: ObjectID) {
        const status = await this.deviceStatusCollection.findOne(
            { 
                _id: statusId,
            }
        );
        if (_.isEmpty(status)) throw new ErrorDeviceStatusInvalid('Device status not found');
        return true;
    }

    async delete(statusId: ObjectID) {
        return this.deviceStatusCollection.deleteOne(statusId);
    }

    // async find(query: any = {}): Promise<DeviceStatus[]> {
    //     const status = await this.deviceStatusCollection.find(query).toArray();
    //     return status;
    // }

    async findOne(query: any = {}, keepAll = false): Promise<DeviceStatus> {
        const status = (await this.deviceStatusCollection.findOne(query)) as DeviceStatus;

        if (_.isEmpty(status)) throw new ErrorDeviceStatusInvalid('Device status not found');
        return keepAll ? status : (_.omit(status) as DeviceStatus);
    }

    async find(query: any = {}, populate = false, limit = 10, simplify = false): Promise<DeviceStatus[]> {
        let aggreateCommand: any[] = [
            { $match: query },
            { $sort: { createdAt: -1 } },
        ];

        if (populate) aggreateCommand = this.populateDeviceStatus(aggreateCommand);

        const status = await this.deviceStatusCollection.aggregate(aggreateCommand).toArray();

        return status;
    }

    private populateDeviceStatus(aggreateCommand: any) {
        return _.concat(aggreateCommand, [
            {
                $lookup: {
                    from: 'devices',
                    localField: 'deviceId',
                    foreignField: '_id',
                    as: 'device',
                },
            },
            { $unwind: '$device' },
        ]);
    }
}
import { ObjectID } from 'mongodb';
import _ from 'lodash';

export class Device {
    readonly _id?: ObjectID;
    id: number;
    name: string;
    unit: string;
    createdAt: number;
    createdBy: ObjectID;
    isDeleted: boolean;
    isWorking: boolean;
    isLocked: boolean;      // Lock from changing
    room?: ObjectID;
}

export function fillDefaultDeviceValue(device: Device): Device {
    return _.merge(
        {
            unit: '',
            createdAt: Math.floor(Date.now() / 1000),
            isLocked: false,
            isDeleted: false,
            isWorking: true,
        },
        device,
    );
}
import { ObjectID } from 'mongodb';
import _ from 'lodash';


export class Device{
    readonly _id?: ObjectID;
    id: number;
    feed:string;
    name: string;
    data: string;
    unit: string;
    createdAt: number;
    createdBy: ObjectID;
    isDeleted: boolean;
    isWorking: boolean;
    room?: ObjectID;
}

export function fillDefaultDeviceValue(device: Device): Device {
    return _.merge(
        {
            name: '',
            data: '',
            unit: '',
            id: '',
            createdAt: Math.floor(Date.now() / 1000),
            isDeleted: false,
            isWorking: true,
        },
        device,
    );
}
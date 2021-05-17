import { ObjectID } from 'mongodb';
import _ from 'lodash';


export class Device{
    deviceID: ObjectID;
    id: number;
    createdAt: number;
    name: string;
    data: string;
    unit: string;
}



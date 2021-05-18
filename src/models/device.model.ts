import { ObjectID } from 'mongodb';
import _ from 'lodash';


export class Device{
    readonly _id?: ObjectID;
    id: number;
    createdAt: number;
    name: string;
    data: string;
    unit: string;
}



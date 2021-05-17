import { ObjectID } from 'mongodb';
import _ from 'lodash';

export class Room{
    roomID: ObjectID;
    createdAt: number;
    name: string;
    devices: ObjectID[];
}
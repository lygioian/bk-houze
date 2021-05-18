import { ObjectID } from 'mongodb';
import _ from 'lodash';
import { User } from './user.model';

export interface Home {
    readonly _id?: ObjectID;
    name: string;
    address: string;
    password: string;
    createdAt: number;
    createdBy: ObjectID;
    routine: { createdAt: number; createdBy: string; config: { deviceId: ObjectID; value: number }; }[];
    user: User[];
    room: [];
}

export function fillDefaultHomeValue(home: Home): Home {
    return _.merge(
        {
            name: '',
            password: '',
            address: '',
            createdAt: Math.floor(Date.now() / 1000),
        },
        home,
    );
}


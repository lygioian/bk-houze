import { injectable, inject } from 'inversify';
import { Collection, ObjectID, ObjectId } from 'mongodb';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import moment from 'moment';

import { DatabaseService } from './database.service';
import { ServiceType } from '../types';

import { ErrorUserInvalid } from '../lib/errors';

import {
    Home,
    fillDefaultHomeValue,
} from '../models/home.model';

import {
    HASH_ROUNDS,
    SocialAccountType,
    VERIRY_CODE_TTL,
    VERIFY_CODE_LENGTH,
    EMAIL_SENDER,
} from '../config';

@injectable()
export class HomeService {
    private homeCollection: Collection;

    constructor(
        @inject(ServiceType.Database) private dbService: DatabaseService,
    ) {
        console.log('[Home service] Construct');
        this.homeCollection = this.dbService.db.collection('homes');
    }

    async create(home: any): Promise<Home> {
        if (_.isEmpty(home.name) || _.isEmpty(home.password)) {
            throw new ErrorUserInvalid('Missing input fields');
        }
        home.password = await bcrypt.hash(home.password, HASH_ROUNDS);
        const addedHome = await this.homeCollection.insertOne(
            fillDefaultHomeValue(home as Home),
        );

        return addedHome.ops[0] as Home;
    }
}
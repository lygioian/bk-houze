import { injectable, inject } from 'inversify';
import { Collection, ObjectID, ObjectId } from 'mongodb';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import moment from 'moment';

import { DatabaseService } from './database.service';
import { UserService } from './user.service';
import { ServiceType } from '../types';
import { ErrorHomeInvalid } from '../lib/errors';
import { lazyInject } from '../container';

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

    @lazyInject(ServiceType.User) private userService: UserService;

    constructor(
        @inject(ServiceType.Database) private dbService: DatabaseService,
    ) {
        console.log('[Home service] Construct');
        this.homeCollection = this.dbService.db.collection('homes');
    }

    async create(home: any): Promise<Home> {
        if (_.isEmpty(home.name) || _.isEmpty(home.password)) {
            throw new ErrorHomeInvalid('Missing input fields');
        }
        home.password = await bcrypt.hash(home.password, HASH_ROUNDS);
        const addedHome = await this.homeCollection.insertOne(
            fillDefaultHomeValue(home as Home),
        );

        return addedHome.ops[0] as Home;
    }

    async update(homeId: ObjectID, data: any) {
        const opUpdateResult = await this.homeCollection.updateOne({ _id: homeId }, { $set: data });
        return opUpdateResult.result.nModified;
    }

    async validateHome(homeId: ObjectId, userId: ObjectId) {
        const home = await this.homeCollection.findOne({ _id: homeId, createdBy: userId });
        if (_.isEmpty(home)) throw new ErrorHomeInvalid('Home not found');

        return true;
    }

    async delete(homeId: ObjectID) {
        return this.update(homeId, { isDeleted: true });
    }

    async updateHomeCount(userId: ObjectId) {
        return await this.userService.updateOne(userId, {
            homeCount: await this.homeCollection.countDocuments({
                user: userId,
                isDeleted: false,
                'files.0': { $exists: true },
            }),
        });
    }

    async find(query: any = {}) {
        const homes = await this.homeCollection.find({"isDeleted": false}).toArray();
        return homes.map((home) => _.omit(home));
    }

    async findOne(query: any = {}, keepAll = false): Promise<Home> {
        const home = (await this.homeCollection.findOne(query)) as Home;

        if (_.isEmpty(home)) throw new ErrorHomeInvalid('User not found');
        return keepAll ? home : (_.omit(home) as Home);
    }

    async createRoutine(homeId: ObjectID, data: any, userId: any) {
        data.createdAt = Math.floor(Date.now() / 1000);
        data.createdBy = userId;
        const opUpdateResult = await this.homeCollection.updateOne({ _id: homeId }, { $push: {"routine": data} });
        return opUpdateResult.result.nModified;
    }
    
}
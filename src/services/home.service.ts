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
    Routine,
    fillDefaultHomeValue,
    fillDefaultRoutineValue
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
    private routineCollection: Collection;

    @lazyInject(ServiceType.User) private userService: UserService;

    constructor(
        @inject(ServiceType.Database) private dbService: DatabaseService,
    ) {
        console.log('[Home service] Construct');
        this.homeCollection = this.dbService.db.collection('homes');
        this.routineCollection = this.dbService.db.collection('routine');
    }

    async createHome(home: any): Promise<Home> {
        if (_.isEmpty(home.name) || _.isEmpty(home.password)) {
            throw new ErrorHomeInvalid('Missing input fields');
        }
        home.password = await bcrypt.hash(home.password, HASH_ROUNDS);
        const addedHome = await this.homeCollection.insertOne(
            fillDefaultHomeValue(home as Home),
        );

        return addedHome.ops[0] as Home;
    }

    async updateHome(homeId: ObjectID, data: any) {
        const opUpdateResult = await this.homeCollection.updateOne({ _id: homeId }, { $set: data });
        return opUpdateResult.result.nModified;
    }

    async validateHome(homeId: ObjectId, userId: ObjectId) {
        const home = await this.homeCollection.findOne({ _id: homeId, createdBy: userId });
        if (_.isEmpty(home)) throw new ErrorHomeInvalid('Home not found');

        return true;
    }

    async deleteHome(homeId: ObjectID) {
        return this.updateHome(homeId, { isDeleted: true });
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

    async findHomes(query: any = {}) {
        const homes = await this.homeCollection.find({"isDeleted": false}).toArray();
        return homes.map((home) => _.omit(home));
    }

    async findOneHome(query: any = {}, keepAll = false): Promise<Home> {
        const home = (await this.homeCollection.findOne(query)) as Home;

        if (_.isEmpty(home)) throw new ErrorHomeInvalid('User not found');
        return keepAll ? home : (_.omit(home) as Home);
    }

    async createRoutine(homeId: ObjectId, position: number = -1) {
        const opRoutineInsertResult = await this.routineCollection.insertOne(
            fillDefaultRoutineValue({ home: homeId } as Routine),
        );

        const insertedRoutine = opRoutineInsertResult.ops[0] as Routine;

        const affectedHome = await this.homeCollection.updateOne(
            { _id: homeId },
            {
                $push: {
                    routines: {
                        $each: [insertedRoutine._id],
                        ...(position >= 0 && { $position: position }),
                    },
                },
            },
        );

        if (affectedHome.modifiedCount == 0) throw new Error('Unable to add file to bundle');

        return { ...insertedRoutine};
    }
    
    async updateRoutine(routineId: ObjectID, data: any) {
        const opUpdateResult = await this.routineCollection.updateOne({ _id: routineId }, { $set: data });
        return opUpdateResult.result.nModified;
    }
}
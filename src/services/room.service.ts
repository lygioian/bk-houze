import { inject, injectable } from 'inversify';
import { Collection, ObjectID } from 'mongodb';
import {
    Room
} from '../models/room.model';
import { EMAIL_API_KEY, ROOT_DOMAIN } from '../config';
import { ServiceType } from '../types';
import { MailService } from './mail.service';
import { DatabaseService } from './database.service';

import { htmlEmail } from '../html-email';

@injectable()
export class RoomService {
    private roomCollection: Collection;

    constructor(
        @inject(ServiceType.Database) private dbService: DatabaseService,
    ) {
        console.log('[Room service] Construct');
        this.roomCollection = this.dbService.db.collection('rooms')
    }


}

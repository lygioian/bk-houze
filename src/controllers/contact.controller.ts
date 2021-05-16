import { Router } from 'express';
import { inject, injectable } from 'inversify';
import _ from 'lodash';

import { Request, Response, ServiceType } from '../types';
import { Controller } from './controller';
import { UploadService, AuthService, MailService, ContactService } from '../services';
import { User } from '../models/user.model';
import { UPLOAD_DIR, EMAIL_SENDER } from '../config';

@injectable()
export class ContactController extends Controller {
    public readonly router = Router();
    public readonly path = '/contact';

    constructor(
        @inject(ServiceType.Contact) private contactService: ContactService,
    ) {
        super();

        this.router.post('/', this.relayContact.bind(this));
    }

    async relayContact(req: Request, res: Response) {
        try {
            await this.contactService.insert(req.body);
            res.composer.success('OK');
        } catch (error) {
            console.log(error);
            res.composer.badRequest(error.message);
        }
    }
}

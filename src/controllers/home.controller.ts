import { Router } from 'express';
import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { Request, Response, ServiceType, PrivacyType } from '../types';
import { Controller } from './controller';
import { HomeService, AuthService } from '../services';

import { Home } from '../models/home.model';

@injectable()
export class HomeController extends Controller {
    public readonly router = Router();
    public readonly path = '/home';

    constructor(
        @inject(ServiceType.Home) private homeService: HomeService,
        @inject(ServiceType.Auth) private authService: AuthService,
    ) {
        super();

        this.router.all('*', this.authService.authenticate());
        this.router.post('/', this.createHome.bind(this));
    }

    async createHome(req: Request, res: Response) {
        const home: Home = _.pick(req.body, ['name', 'password']) as any;
        home.createdBy = req.tokenMeta.userId;

        try {
            const createdHome = await this.homeService.create(home);
            res.composer.success('Home created');
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    } 
}

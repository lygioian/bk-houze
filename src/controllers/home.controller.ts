import { Router } from 'express';
import { inject, injectable } from 'inversify';
import _ from 'lodash';

import { ObjectID } from 'bson';
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
        this.router.patch('/:homeId', this.updateHome.bind(this));
        this.router.delete('/:homeId', this.deleteHome.bind(this));
        this.router.get('/', this.getHomes.bind(this));
    }

    async createHome(req: Request, res: Response) {
        const home: Home = _.pick(req.body, ['name', 'password', 'address']) as any;
        home.createdBy = req.tokenMeta.userId;

        try {
            const createdHome = await this.homeService.create(home);
            res.composer.success('Home created');
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    } 

    async updateHome(req: Request, res: Response) {
        try {
            const homeId = ObjectID.createFromHexString(req.params.homeId);
            await this.homeService.validateHome(
                homeId,
                req.tokenMeta.userId,
            );
            const affectedCount = await this.homeService.update(
                homeId,
                _.pick(req.body, ['name', 'address']),
            );

            res.composer.success(affectedCount);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    async deleteHome(req: Request, res: Response) {
        try {
            const { userId } = req.tokenMeta;

            const homeId = ObjectID.createFromHexString(req.params.homeId);
            await this.homeService.validateHome(homeId, userId);
            const affectedCount = await this.homeService.delete(homeId);
            this.homeService.updateHomeCount(userId);

            if (affectedCount == 0) throw new Error('Home already deleted');

            res.composer.success(homeId);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    async getHomes(req: Request, res: Response) {
        try {
            const homes = await this.homeService.find();
            res.composer.success(homes);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }
}

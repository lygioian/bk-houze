import { Router } from 'express';
import { inject, injectable } from 'inversify';
import _ from 'lodash';

import { ObjectID } from 'bson';
import { Request, Response, ServiceType, PrivacyType } from '../types';
import { Controller } from './controller';
import { HomeService, AuthService } from '../services';

import { Home, Routine } from '../models/home.model';

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
        this.router.get('/:name', this.getByName.bind(this));
        this.router.post('/:homeId/routine', this.createRountine.bind(this));
        this.router.patch('/:homeId/routine/:routineId', this.updateRoutine.bind(this));
        this.router.delete('/:homeId/routine/:routineId', this.deleteRoutine.bind(this));
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
            await this.homeService.validate(
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
            await this.homeService.validate(homeId, userId);
            const affectedCount = await this.homeService.delete(homeId);
            this.homeService.updateCount(userId);

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

    async getByName(req: Request, res: Response) {
        const { name } = req.params;
        const { userId: tokenUserId } = req.tokenMeta;

        try {
            const home = await this.homeService.findOne({ name });
            if (!home) {
                res.composer.notFound('User not found');
            }
            res.composer.success(home);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    async createRountine(req: Request, res: Response) {
        try {
            const homeId = ObjectID.createFromHexString(req.params.homeId);
            await this.homeService.validate(
                homeId,
                req.tokenMeta.userId,
            );

            const position = +req.body.position;
            const addedroutine = await this.homeService.createRoutine(
                homeId,
                position
            );
            res.composer.success(addedroutine);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    async updateRoutine(req: Request, res: Response) {
        try {
            const homeId = ObjectID.createFromHexString(req.params.homeId);
            await this.homeService.validate(
                homeId,
                req.tokenMeta.userId,
            );

            const routineId = ObjectID.createFromHexString(req.params.routineId);
            const affectedCount = await this.homeService.updateRoutine(
                routineId,
                _.pick(req.body, ['config']),
            );

            res.composer.success(affectedCount);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    async deleteRoutine(req: Request, res: Response) {
        try {
            const homeId = ObjectID.createFromHexString(req.params.homeId);
            await this.homeService.validate(
                homeId,
                req.tokenMeta.userId,
            );

            const routineId = ObjectID.createFromHexString(req.params.routineId);
            const affectedCount = await this.homeService.deleteRoutine(
                homeId,
                routineId,
            );

            res.composer.success(affectedCount);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }
}

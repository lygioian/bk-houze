import { Router } from 'express';
import { inject, injectable } from 'inversify';
import _ from 'lodash';

import { Request, Response, ServiceType } from '../types';
import { Controller } from './controller';
import { UploadService, AuthService, MailService, RoomService } from '../services';
import { User } from '../models/user.model';
import { UPLOAD_DIR, EMAIL_SENDER } from '../config';

@injectable()
export class RoomController extends Controller {
    public readonly router = Router();
    public readonly path = '/room';

    constructor(
        @inject(ServiceType.Room) private roomService: RoomService,
        @inject(ServiceType.Auth) private authService: AuthService,
    ) {
        super();
        this.router.all('*', this.authService.authenticate());
        this.router.post('/',this.createRoom.bind(this))
    }


    
async createRoom(req: Request, res: Response){
    try {
        // const createdSlug = await this.roomService.create(
        //     req.tokenMeta.userId,
        // );
        res.composer.success('Room created');
    } catch (error) {
        res.composer.badRequest(error.message);
    }
}



async updateRoom(req: Request, res: Response){

}

async deleteRoom(req: Request, res: Response){

}

async getRoomDetail(req: Request, res: Response){

}

async getRooms(req: Request, res: Response){

}

async addDevice(req: Request, res: Response){

}

async updateDevice(req: Request, res: Response){

}

async deleteDevice(req: Request, res: Response){

}

async getRoomDevices(req: Request, res: Response){

}

async getRoomDeviceDetail(req: Request, res: Response){

}

}
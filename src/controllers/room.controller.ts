import { Router } from 'express';
import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { Request, Response, ServiceType, PrivacyType } from '../types';
import { Controller } from './controller';
import { UploadService, AuthService, MailService, RoomService } from '../services';
import { User } from '../models/user.model';
import { UPLOAD_DIR, EMAIL_SENDER } from '../config';
import { Room } from '../models/room.model';
import { ObjectID, ObjectId } from 'mongodb';
import { homedir } from 'os';
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
        this.router.post('/',this.createRoom.bind(this));
        this.router.patch('/:roomId', this.updateRoom.bind(this));
        this.router.delete('/:roomId', this.deleteRoom.bind(this));
        this.router.get('/', this.getRooms.bind(this));
        this.router.get('/:name', this.getRoomDetail.bind(this));
        this.router.post('/:name', this.addDevice.bind(this));
        this.router.post('/:roomId/device', this.addDevice.bind(this));
        this.router.patch('/:roomId/device/:deviceId', this.updateDevice.bind(this));
        this.router.delete('/:roomId/device/:deviceId', this.deleteDevice.bind(this));
    }


    
async createRoom(req: Request, res: Response){
    const room: Room = _.pick(req.body, ['name']) as any;
    room.createdBy = req.tokenMeta.userId;
    try {
        const createdRoom = await this.roomService.create(room);
        res.composer.success('Room created');
    } catch (error) {
        res.composer.badRequest(error.message);
    }
}



async updateRoom(req: Request, res: Response){
    try {
        const roomId = ObjectID.createFromHexString(req.params.roomId);
        await this.roomService.validateRoom(
            roomId,
            req.tokenMeta.userId,
        );
        const affectedCount = await this.roomService.update(
            roomId,
            _.pick(req.body, ['name'])
        );
        res.composer.success(affectedCount);
    } catch(error){
        res.composer.badRequest(error.message);
    }
}

async deleteRoom(req: Request, res: Response){
    try {
        const { userId } = req.tokenMeta;
        const roomId = ObjectID.createFromHexString(req.params.roomId);
        await this.roomService.validateRoom( roomId, userId);
        const affectedCount = await this.roomService.delete(roomId);
        if (affectedCount == 0) throw new Error('Room already deleted');
        res.composer.success(roomId)
    } catch (error){
        res.composer.badRequest(error.message)
    }
}

async getRoomDetail(req: Request, res: Response){
    const { name } = req.params;
    const { userId: tokenUserId } = req.tokenMeta;
    try {
        const room = await this.roomService.findOne({name});
        if( !room ){
            res.composer.notFound('Room not found');
        }
        res.composer.success(room);
    } catch (error){
        res.composer.badRequest(error.message);
    }
}

async getRooms(req: Request, res: Response){
    try {
        const rooms = await this.roomService.find();
        res.composer.success(rooms);
    } catch (error) {
        res.composer.badRequest(error.message);
    }
}

async addDevice(req: Request, res: Response){
    try{
        const roomId = ObjectID.createFromHexString(req.params.roomId);
        await this.roomService.validateRoom(
            roomId,
            req.tokenMeta.userId,
        );
        const position = +req.body.position;
        const addedDevice = await this.roomService.addDevice(
            roomId,
            position,
        );
        res.composer.success(addedDevice);
    } catch (error) {
        res.composer.badRequest(error.message)
    }
}

async updateDevice(req: Request, res: Response){
    try{
        const roomId = ObjectID.createFromHexString(req.params.roomId);
        await this.roomService.validateRoom(
            roomId,
            req.tokenMeta.userId,
        );
        const deviceId = ObjectID.createFromHexString(req.params.deviceId);
        const affectedCount = await this.roomService.updateDevice(
            deviceId,
            _.pick(req.body, ['name', 'id', 'unit', 'data']),
        );
        res.composer.success(affectedCount);
    } catch(error){
        res.composer.badRequest(error.message);
    }
}

async deleteDevice(req: Request, res: Response){
    try{
        const roomId = ObjectID.createFromHexString(req.params.roomId);
        await this.roomService.validateRoom(
            roomId,
            req.tokenMeta.userId,
        );

        const deviceId = ObjectID.createFromHexString(req.params.deviceId);
        const affectedCount = await this.roomService.deleteDevice(
            roomId,
            deviceId,
        );
        res.composer.success(affectedCount);
    } catch (error){
        res.composer.badRequest(error.message);
    }
}

async getRoomDevices(req: Request, res: Response){

}

async getRoomDeviceDetail(req: Request, res: Response){

}

}
import { Router } from 'express';
import { inject, injectable } from 'inversify';
import _ from 'lodash';

import { ObjectID } from 'bson';
import { Request, Response, ServiceType, PrivacyType } from '../types';
import { Controller } from './controller';
import { DeviceService, AuthService, MQTTService } from '../services';
import { SupportedDevices, getDeviceName } from '../config';

import { Device } from '../models/device.model';

@injectable()
export class DeviceController extends Controller {
    public readonly router = Router();
    public readonly path = '/device';

    constructor(
        @inject(ServiceType.MQTT) private mqttService: MQTTService,
        @inject(ServiceType.Device) private deviceService: DeviceService,
        @inject(ServiceType.Auth) private authService: AuthService,
    ) {
        super();

        this.router.all('*', this.authService.authenticate());

        // POST API
        this.router.post('/', this.createDevice.bind(this));
        this.router.post('/control', this.controlDevice.bind(this));

        // GET API
        this.router.get('/', this.getDevices.bind(this));
        this.router.get('/:name', this.getDevicesByName.bind(this));
        this.router.get('/status', this.getCurrentDeviceStatus.bind(this));
        this.router.get('/history', this.getAllDeviceStatus.bind(this));
        this.router.get('/support', this.getAllSupportedDevices.bind(this));
    }

    /*
    Create new device of a type ('name')
    */
    async createDevice(req: Request, res: Response) {
        const device: Device = _.pick(req.body, ['name']) as any;
        const newDeviceId = await this.deviceService.getNewDeviceId(device.name);

        // Add fields
        device.id = newDeviceId;
        device.createdBy = req.tokenMeta.userId;

        try {
            await this.deviceService.create(device);
            res.composer.success('Device created');
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    /*
    Control a device via API request
    */
    async controlDevice(req: Request, res: Response) {
        const t = _.pick(req.body, ['id', 'name', 'data']) as any;
        try {
            this.mqttService.publish(t.id, t.name, t.data);
            res.composer.success("Device operated");
        }
        catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    /*
    Get all devices, literally
    */
    async getDevices(req: Request, res: Response) {
        console.log("Get devices");
        try {
            const devices = await this.deviceService.find();
            res.composer.success(devices);
        }
        catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    /*
    Get all devices of a type ('name')
    */
    async getDevicesByName(req: Request, res: Response) {
        const { name } = req.params;
        try {
            const devices = await this.deviceService.find({ name });
            res.composer.success(devices);
        }
        catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    /*
    Get current device status by format
    {
        id: <number>,
        name: <string>,
    }
    */
    async getCurrentDeviceStatus(req: Request, res: Response) {
        const query = _.pick(req.body, ['id', 'name']) as any;
        try {
            const devices = await this.deviceService.find(query);

            // Get the latest status
            const device = _.maxBy(devices, 'createdAt');
            res.composer.success(device);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    /*
    Get all history status of a device (sorted ascending by 'createdAt')
    */
    async getAllDeviceStatus(req: Request, res: Response) {
        const query = _.pick(req.body, ['id', 'name']) as any;
        try {
            const devices = await this.deviceService.find(query);
            const sorted = _.sortBy(devices, ['createdAt']);
            res.composer.success(sorted);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    /*
    Get all support type of devices
    */
    async getAllSupportedDevices(req: Request, res: Response) {
        console.log("HEloo");
        try {
            const names = SupportedDevices.map((device) => getDeviceName(device));
            res.composer.success(names);
        }
        catch (error) {
            res.composer.badRequest(error.message);
        }
    }
}

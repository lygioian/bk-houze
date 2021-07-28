import { Router } from 'express';
import { inject, injectable } from 'inversify';
import _ from 'lodash';

import { ObjectID } from 'bson';
import { Request, Response, ServiceType, PrivacyType } from '../types';
import { Controller } from './controller';
import {
    DeviceService,
    DeviceStatusService,
    AuthService,
    MQTTService,
} from '../services';
import { SupportedDevices, getDeviceName } from '../config';

import { Device } from '../models/device.model';
import { triggerAsyncId } from 'async_hooks';

@injectable()
export class DeviceController extends Controller {
    public readonly router = Router();
    public readonly path = '/device';

    constructor(
        @inject(ServiceType.MQTT) private mqttService: MQTTService,
        @inject(ServiceType.Device) private deviceService: DeviceService,
        @inject(ServiceType.DeviceStatus)
        private deviceStatusService: DeviceStatusService,
        @inject(ServiceType.Auth) private authService: AuthService,
    ) {
        super();

        this.router.all('*', this.authService.authenticate());

        // POST API
        this.router.post('/', this.createDevice.bind(this));
        this.router.post('/control', this.controlDevice.bind(this));
        this.router.post('/lock', this.lockDevice.bind(this));
        this.router.post('/unlock', this.unlockDevice.bind(this));
        this.router.post('/routine', this.routineDevice.bind(this));

        // GET API
        this.router.get('/', this.getDevices.bind(this));
        this.router.get('/history', this.getAllStatusHistory.bind(this));
        this.router.get('/support', this.getAllSupportedDevices.bind(this));
        this.router.get('/:name', this.getDevicesByName.bind(this));
        this.router.get('/:id/status', this.getCurrentDeviceStatus.bind(this));
        this.router.get('/:id/history', this.getDeviceStatusHistory.bind(this));
    }

    /*
    Create new device of a type ('name')
    */
    async createDevice(req: Request, res: Response) {
        const device: Device = _.pick(req.body, ['name', 'id']) as Device;

        // Add fields
        // device.id = newDeviceId;
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
        const device: Device = await this.deviceService.findOneOrCreate({
            _id: ObjectID.createFromHexString(req.body.id),
        });
        const data: string = req.body.data;
        try {
            this.mqttService.publish(device.id, device.name, data);
            res.composer.success('Device operated');
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    /*
    Get all devices, literally
    */
    async getDevices(req: Request, res: Response) {
        try {
            const devices = await this.deviceService.find();
            res.composer.success(devices);
        } catch (error) {
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
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    /*
    Get current device status
    */
    async getCurrentDeviceStatus(req: Request, res: Response) {
        const deviceId = ObjectID.createFromHexString(req.params.id);
        try {
            const status = await this.deviceStatusService.find({
                deviceId: deviceId,
            });
            const curr = _.maxBy(status, 'createdAt'); // Get the latest status
            res.composer.success(curr);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    /*
    Get all history status of a device
    */
    async getDeviceStatusHistory(req: Request, res: Response) {
        const deviceId = ObjectID.createFromHexString(req.params.id);
        try {
            const status = await this.deviceStatusService.find(
                { deviceId: deviceId },
                true,
            );
            res.composer.success(status);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    /*
    Get historical status of all devices
    */
    async getAllStatusHistory(req: Request, res: Response) {
        try {
            const status = await this.deviceStatusService.find({}, true);
            res.composer.success(status);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    /*
    Get all support type of devices
    */
    async getAllSupportedDevices(req: Request, res: Response) {
        try {
            const names = SupportedDevices.map((device) =>
                getDeviceName(device),
            );
            res.composer.success(names);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    /*
    Lock a device from external changing
    */
    async lockDevice(req: Request, res: Response) {
        const deviceId = ObjectID.createFromHexString(req.body.id);
        try {
            const n = await this.deviceService.update(deviceId, {
                isLocked: true,
            });
            res.composer.success(`${n} Device ${deviceId} is locked`);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }
    /*
    Unlock a device for external changing
    */
    async unlockDevice(req: Request, res: Response) {
        const deviceId = ObjectID.createFromHexString(req.body.id);
        try {
            const n = await this.deviceService.update(deviceId, {
                isLocked: false,
            });
            res.composer.success(`${n} Device ${deviceId} is unlocked`);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }

    async routineDevice(req: Request, res: Response) {
        const data: string = req.body.data;

        function cron(ms: any, fn: any, stopfn: any) {
            function cb() {
                clearTimeout(timeout);
                if (stopfn() == true) return;

                timeout = setTimeout(cb, ms);
                fn();
            }
            let timeout = setTimeout(cb, ms);
            return {};
        }

        const deviceId = ObjectID.createFromHexString(req.body.id);

        if (req.body.isLoop) {
            cron(
                10000,
                async () => {
                    const device: Device = await this.deviceService.findOneOrCreate(
                        {
                            _id: ObjectID.createFromHexString(req.body.id),
                        },
                    );
                    console.log('Hello Anonystick in middleware ');
                    console.log(device.data, data, 'Data');

                    if (device.data == data) return;
                    console.log(device.data, data, 'Data');
                    this.mqttService.publish(device.id, device.name, data);
                },
                async () => {
                    const n = await this.deviceService.findOne({
                        _id: deviceId,
                    });
                    console.log('Found n');
                    if (n.isLoopEvent == false) return true;
                    else return false;
                },
            );
        } else {
            setTimeout(async () => {
                const device: Device = await this.deviceService.findOneOrCreate(
                    {
                        _id: ObjectID.createFromHexString(req.body.id),
                    },
                );
                this.mqttService.publish(device.id, device.name, data);

                console.log('No Loop');
            }, 10000);
        }

        const n = await this.deviceService.update(deviceId, {
            // data: req.body.data,
            isLoopEvent: true,
        });

        try {
            res.composer.success(`Device ${deviceId} is in Schedule`);
        } catch (error) {
            res.composer.badRequest(error.message);
        }
    }
}

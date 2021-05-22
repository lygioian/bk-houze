import mqtt from 'mqtt';
import { inject, injectable } from 'inversify';
import { DeviceTopic, SupportedDevices, getDeviceName } from '../config';
import { DeviceService } from './device.service';
import { DeviceStatusService } from './device_status.service';
import { lazyInject } from '../container';
import { ServiceType } from '../types';
import { ServerEventSystem } from '../server-events';

@injectable()
export class MQTTService {
    private client: any;
    private topics: DeviceTopic[];
    private options: any;

    @lazyInject(ServiceType.Device) private deviceService: DeviceService;
    @lazyInject(ServiceType.DeviceStatus) private deviceStatusService: DeviceStatusService;

    constructor() {
        console.log('[MQTT service] Construct');
        this.topics = [];
        this.options = {
            username: 'ultrahouze',
            password: 'aio_Olop66Lr6avn1nuNJTlTv5t15uJt',
        };
    }

    async initialize() {
        console.log('[MQTT] Prepare to connect MQTT with connection string:');
        try {
            this.client = mqtt.connect('https://io.adafruit.com/', this.options);

            // Connect Adafruit and subscribe all default topics
            await this.client.on('connect', () => {
                console.log('[MQTT] MQTT connected !');
                SupportedDevices.map((topic: DeviceTopic) => {
                    this.subscribe(topic);
                });
            });

            // Listen for any message from topics
            await this.client.on('message', this.onMessage);
            
            // Receive error message
            this.client.on('error', (error: any) => {
                console.log("Can't connect" + error);
                process.exit(1);
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    onMessage = async (topic: any, message: any) => {
        console.log(
            "Received '" + message + "' on '" + topic + "'",
        );
        
        /* NOTICE:
         * 'message' from Adafruit should have format:
         * {
         *      'id': '<number_but_in_string>',
         *      'name': '<device_type/name>',
         *      'data': '<value>',
         *      'unit': '<something>,
         * }
        */
        // Create a new Device document in MongoDB
        var deviceName = getDeviceName(topic.split("/")[2]);
        if (deviceName === null) return;
        const parsedMess = JSON.parse(message.toString());

        const device = await this.deviceService.findOneOrCreate({
            id: +parsedMess.id,
            name: parsedMess.name,
            unit: parsedMess.unit,
        });

        console.log("Device change: ", device)
        await this.deviceStatusService.create({
            deviceId: device._id,
            data: parsedMess.data,
        });

        ServerEventSystem.notifyUpdate(JSON.stringify(device._id));
    }

    subscribe(topic: DeviceTopic) {
        // Subscribe a topic listed in the list of topics
        if (this._validateTopic(topic)) {
            console.log("[MQTT] Topic already subscribed:", topic);
            return;
        }
        var path: string = this._getTopicPath(topic);
        this.topics.push(topic);
        this.client.subscribe(path);
        console.log("[MQTT] Subscribed topic:", path);
    }

    unsubscribe(topic: DeviceTopic) {
        // Unsubscribe a topic listed in the list of topics
        if (!this._validateTopic(topic)) {
            console.log("[MQTT] Not yet subscribe:", topic);
            return;
        }
        var path: string = this._getTopicPath(topic);
        this.topics = this.topics.filter(obj => obj !== topic);
        this.client.unsubscribe(path);
        console.log("[MQTT] Unsubscribed topic:", path);
    }

    publish(deviceId: number, deviceName: string, data: string) {
        const idx = SupportedDevices.map((d) => getDeviceName(d)).indexOf(deviceName);
        const topic = SupportedDevices[idx];
        const message = {
            id: String(deviceId),
            name: deviceName,
            data: data,
            unit: "",
        }
        console.log(message);
        this._publish(topic, message);
    }

    private _publish(topic: DeviceTopic, message: any) {
        if (!this._validateTopic(topic)) {
            console.log("[MQTT] Subscribe '" + topic + "' before publishing !");
            return;
        }
        var path: string = this._getTopicPath(topic);
        this.client.publish(path, JSON.stringify(message));
        console.log("Message is published to MQTT");
    }

    private _getTopicPath(topic: DeviceTopic): string {
        var path: string = `${this.options.username}/feeds/${topic}`;
        return path;
    }
    private _validateTopic(topic: DeviceTopic): boolean {
        return this.topics.includes(topic);
    }
}

import { inject, injectable } from 'inversify';
import { MongoClient, Db } from 'mongodb';
import { DB_CONN_STRING, DB_NAME, DeviceTopic } from '../config';
import mqtt from 'mqtt';
import { Device } from '../models/device.model';
import { DeviceService } from './device.service';

var defaultTopics = [DeviceTopic.LED, DeviceTopic.MAGNETIC];

function getDeviceName(topic: string): string {
    var name: string = topic.split("/")[2];
    switch (name) {
        case DeviceTopic.LED:
            return "LED";
        case DeviceTopic.SPEAKER:
            return "SPEAKER";
        case DeviceTopic.MAGNETIC:
            return "MAGNETIC";
        default:
            return "";
    }
}

async function createDeviceHistory(topic: string, message: any): any {
    var name = getDeviceName(topic);
    if (name === null) return;
    var device = {
        id: 0,
        name: name,
    };
    return await DeviceService.create(device);
}

@injectable()
export class MQTTService {
    private client: any;
    private topics: DeviceTopic[];
    private options: any;

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
                defaultTopics.map((topic: DeviceTopic) => {
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

    onMessage(topic: any, message: any) {
        console.log(
            "Received '" + message + "' on '" + topic + "'",
        );
        // Create Device document in MongoDB
        createDeviceHistory(topic, message);
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

    publish(topic: DeviceTopic, message: any) {
        if (!this._validateTopic(topic)) {
            console.log("[MQTT] Subscribe '", topic, "' before publishing!");
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

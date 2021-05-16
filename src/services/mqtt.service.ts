import { inject, injectable } from 'inversify';
import { MongoClient, Db } from 'mongodb';
import { DB_CONN_STRING, DB_NAME } from '../config';
import mqtt from 'mqtt';

@injectable()
export class MQTTService {
    private client: any;
    private _db: Db;

    constructor() {
        console.log('[MQTT service] Construct');
    }

    async initialize() {
        console.log('[MQTT] Prepare to connect MQTT with connection string:');

        try {
            var options = {
                username: 'lygioian',
                password: 'aio_AyKV00DTbaTOr5mGpNyYKPjPsb1y',
            };
            this.client = mqtt.connect('https://io.adafruit.com/', options);

            await this.client.on('connect', () => {
                console.log('[MQTT] MQTT connected !');
                this.client.subscribe('lygioian/feeds/welcome-feed', () => {
                    // when a message arrives, do something with it
                    this.client.on(
                        'message',
                        (topic: any, message: any, packet: any) => {
                            console.log(
                                "Received '" + message + "' on '" + topic + "'",
                            );
                        },
                    );
                });

                // publish a message to a topic
                this.client.publish(
                    'lygioian/feeds/welcome-feed',
                    JSON.stringify(options),
                    () => {
                        console.log('Message is published');
                        // this.client.end(); // Close the connection when published
                    },
                );
            });

            this.client.on('error', (error: any) => {
                console.log("Can't connect" + error);
                process.exit(1);
            });
        } catch (error) {
            console.log(error);
        }
    }

    get db(): Db {
        return this._db;
    }
}

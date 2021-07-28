import { DeviceTopic, getDeviceName } from "../config";
import { DeviceService, MQTTService } from "../services";
import { inject } from 'inversify';
import { ServiceType } from '../types';

class PlantWatering {
    constructor(
        private deviceService: DeviceService,
        private mqttService: MQTTService,
    ) {
        console.log('[Plant Watering Management] Construct');
    }

    async update(data: any) {
        const device = await this.deviceService.findOne({
            _id: data.deviceId,
            name: data.name});

        /* data.data < 100: arid soil => relay will turn on */
        if (data.data < 100) {
            const relayName = getDeviceName(DeviceTopic.RELAY);
            this.mqttService.publish(11,relayName,'1');
        }
        /* relay will turn off */
        else {
            const relayName = getDeviceName(DeviceTopic.RELAY);
            this.mqttService.publish(11,relayName,'0');
        }
    }
}

export default PlantWatering;

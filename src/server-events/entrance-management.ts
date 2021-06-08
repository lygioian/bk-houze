import { inject } from 'inversify';
import { ServiceType } from '../types';
import {
    DeviceService,
    MQTTService,
} from '../services';

class EntranceManagement {
    constructor(
        private deviceService: DeviceService,
        private mqttService: MQTTService,
    ) {
        console.log("[Entrance Management] Construct");
    }

    async update(data: any) {
        const device = await this.deviceService.findOne({
            id: data.deviceId,
            name: data.name
        });
        /*
            data.data == 0: door is opened.
            Check if device is locked => alert intrusion
        */
        if (data.data == "0" && device.isLocked) {
            console.log("Alert, intruder!!!");

            /*
            Enable buzzer at 256
            (Later will add timeout callback to stop buzzer after 10 mins or maybe not)
            */
            this.mqttService.publish(device.id, device.name, "256");
        }
    }
}

export default EntranceManagement;
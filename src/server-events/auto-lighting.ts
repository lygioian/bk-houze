import { inject } from 'inversify';
import { ServiceType } from '../types';
import { DeviceService, MQTTService } from '../services';
import { DeviceTopic, getDeviceName } from '../config';

class AutoLighting {
    constructor(
        private deviceService: DeviceService,
        private mqttService: MQTTService,
    ) {
        console.log('[Auto Lightning Management] Construct');
    }

    async update(data: any) {
        const device = await this.deviceService.findOne({
            _id: data.deviceId,
            name: data.name,
        });

        if (data.data < 100) {
            const ledName = getDeviceName(DeviceTopic.LED);
            this.mqttService.publish(1, ledName, '2');
        } else {
            const ledName = getDeviceName(DeviceTopic.LED);
            this.mqttService.publish(1, ledName, '1');
        }
    }
}

export default AutoLighting;

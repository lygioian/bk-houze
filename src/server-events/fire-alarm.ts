import { inject } from 'inversify';
import { ServiceType } from '../types';
import { DeviceService, MQTTService } from '../services';
import { DeviceTopic, getDeviceName } from '../config'
class FireAlarm {
    constructor(
        private deviceService: DeviceService,
        private mqttService: MQTTService,
    ){
        console.log('[Fire Alarm Managment] Construct')
    }

    async update(data: any) {
        const device = await this.deviceService.findOne({
            _id: data.deviceId,
            name: data.name,
        })
            var receivedData = parseInt(data.data, 10);
        if (receivedData > 58){
            const buzzerName = getDeviceName(DeviceTopic.SPEAKER);
            this.mqttService.publish(2, buzzerName, '256');
        }
        if(data.data == 1){
            const buzzerName = getDeviceName(DeviceTopic.SPEAKER);
            this.mqttService.publish(2, buzzerName, '256');
        }
    }
}

export default FireAlarm;

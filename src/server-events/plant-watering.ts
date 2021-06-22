import { DeviceTopic, getDeviceName } from "../config";
import { DeviceService, MQTTService } from "../services";

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
        if (data.data < 100) {
            const relayName = getDeviceName(DeviceTopic.RELAY);
            this.mqttService.publish(11,relayName,'1');
        }
        else {
            const relayName = getDeviceName(DeviceTopic.RELAY);
            this.mqttService.publish(11,relayName,'0');
        }
    }
}

export default PlantWatering;

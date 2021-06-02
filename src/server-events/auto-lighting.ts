import {
    DeviceService,
    DeviceStatusService,
    AuthService,
    MQTTService,
} from '../services';

class AutoLighting {
    constructor(private deviceService: DeviceService) {}

    update(data: any) {}
}

export default AutoLighting;

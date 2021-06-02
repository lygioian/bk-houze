class TrackingDevice {
    private deviceConnecting: any;

    constructor() {
        this.deviceConnecting = [];
    }

    add(deviceName: any, obj: any) {
        this.deviceConnecting.push({
            name: deviceName,
            observer: obj,
        });
    }

    remove(socketId: any) {
        this.deviceConnecting = this.deviceConnecting.filter(
            (val: any) => val.name !== name,
        );
    }

    update(deviceName: any, data: any) {
        this.deviceConnecting.map((e: any) => {
            if (e.deviceName[0] == deviceName) e.update(data);
            if (e.deviceName.length > 1) {
                if (e.deviceName[1] == deviceName) e.update(data);
            }
        });
    }

    getDeviceConnecting() {
        return this.deviceConnecting;
    }
}

export default TrackingDevice;

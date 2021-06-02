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

    update(deviceName: any) {
        this.deviceConnecting.map((e: any) => {
            if (e.deviceName[0] == deviceName) e.update();
            if (e.deviceName.length > 1) {
                if (e.deviceName[1] == deviceName) e.update();
            }
        });
    }

    getDeviceConnecting() {
        return this.deviceConnecting;
    }
}

export default TrackingDevice;

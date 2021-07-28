import path from 'path';
import { Device } from './models/device.model';

export const IS_PRODUCTION = process.env.NODE_ENV == 'production';

export const SERVICE_PORT = +process.env.PORT || 5000;
export const SERVICE_NAME = 'BUGS';

export const ROOT_DOMAIN = 'bugs.vn';

export const FE_ADDRESS = IS_PRODUCTION
    ? 'https://bugs.vn/'
    : 'http://localhost:5000/';

const DB_HOST = IS_PRODUCTION ? 'srv-captain--mongodb' : '112.213.91.209';
const DB_PORT = IS_PRODUCTION ? 27017 : 27071;
const DB_USERNAME = 'dbBugs';
const DB_PASSWORD = '2W8F5Ewr';

export const DB_NAME = 'bugs';
export const DB_CONN_STRING =
    'mongodb+srv://admin:123@cluster0-obkrz.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true';
// export const DB_CONN_STRING = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=${DB_NAME}`;

export const HASH_ROUNDS = 10;
export const PASSWORD_SCERET_KEY = 'AQ!@(!NFAJF*((!@#*(R)!U__*#';
export const JWT_SECRET =
    '4A7F95E8D85601B138CDE8172C64A0AB5E6BBDECD9897E0BBB344143AD0CD2D1B8286939BA2FA9AB2299DF70A847B443B8DDB3C25FB7184B17A98D27D4FD420D1631A9';

export const WORKING_DIR = path.resolve(process.env.WORKING_DIR);
export const STATIC_DIR = path.join(WORKING_DIR, 'static');
export const UPLOAD_DIR = path.join(WORKING_DIR, 'uploads');

console.log('WORKING_DIR', WORKING_DIR);
console.log('STATIC_DIR', STATIC_DIR);
console.log('UPLOAD_DIR', UPLOAD_DIR);

export const TOKEN_TTL = 365 * 24 * 60 * 60;
export const VERIFY_CODE_LENGTH = 32;
export const VERIRY_CODE_TTL = 365 * 24 * 60 * 60;

// Email config
export const EMAIL_API_KEY =
    '42edf1e5de12e1d77333e5e846350d04-9c988ee3-6b8668fd';
export const EMAIL_API_URL = 'https://api.mailgun.net/v3/bugs.vn';
export const EMAIL_SENDER = 'Bugs <register@bugs.vn>';

export enum SortType {
    ASC = 'asc',
    DESC = 'desc',
}

export enum SocialAccountType {
    Zalo = 'zalo',
    Facebook = 'facebook',
}

export const DATE_FORMAT = 'DD/MM/YYYY';

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

export enum Language {
    VIETNAMESE = 'vi',
    ENGLISH = 'en',
}

export enum Theme {
    DARK = 'dark',
    LIGHT = 'light',
}

// Device topic to subscribe Adafruit
export enum DeviceTopic {
    LED = 'bk-iot-led',
    SPEAKER = 'bk-iot-speaker',
    LCD = 'bk-iot-lcd',
    BUTTON = 'bk-iot-button',
    TOUCH = 'bk-iot-touch',
    TRAFFIC = 'bk-iot-traffic',
    TEMP_HUMID = 'bk-iot-temp-humid',
    MAGNETIC = 'bk-iot-magnetic',
    SOIL = 'bk-iot-soil',
    DRV = 'bk-iot-drv',
    RELAY = 'bk-iot-relay',
    SOUND = 'bk-iot-sound',
    LIGHT = 'bk-iot-light',
    INFRARED = 'bk-iot-infrared',
    SERVO = 'bk-iot-servo',
    TIME = 'bk-iot-time',
    GAS = 'bk-iot-gas',
}
export function getDeviceName(topic: DeviceTopic): string {
    switch (topic) {
        case DeviceTopic.LED:
            return 'LED';
        case DeviceTopic.SPEAKER:
            return 'SPEAKER';
        case DeviceTopic.LCD:
            return 'LCD';
        case DeviceTopic.BUTTON:
            return 'BUTTON';
        case DeviceTopic.TOUCH:
            return 'TOUCH';
        case DeviceTopic.TRAFFIC:
            return 'TRAFFIC';
        case DeviceTopic.TEMP_HUMID:
            return 'TEMP-HUMID';
        case DeviceTopic.MAGNETIC:
            return 'MAGNETIC';
        case DeviceTopic.SOIL:
            return 'SOIL';
        case DeviceTopic.DRV:
            return 'DRV_PWM';
        case DeviceTopic.RELAY:
            return 'RELAY';
        case DeviceTopic.SOUND:
            return 'SOUND';
        case DeviceTopic.LIGHT:
            return 'LIGHT';
        case DeviceTopic.INFRARED:
            return 'INFRARED';
        case DeviceTopic.SERVO:
            return 'SERVO';
        case DeviceTopic.TIME:
            return 'TIME';
        case DeviceTopic.GAS:
            return 'GAS';
        default:
            return null;
    }
}

// List of all supported devices
export const SupportedDevices = [
    DeviceTopic.LED,
    DeviceTopic.SPEAKER,
    DeviceTopic.TEMP_HUMID,
    DeviceTopic.MAGNETIC,
    DeviceTopic.SOIL,
    DeviceTopic.SOUND,
    DeviceTopic.LIGHT,
    DeviceTopic.INFRARED,
    DeviceTopic.TIME,
    DeviceTopic.GAS,
    DeviceTopic.RELAY,
];

export const LIMIT_PAGING = 24;

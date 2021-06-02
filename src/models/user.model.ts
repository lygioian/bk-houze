import { ObjectID } from 'mongodb';
import _ from 'lodash';

export const USER_FORBIDDEN_FIELDS = [
    'password',
    'isArchived',
    'isActivated',
    'isVerified',
    'recoverPasswordCode',
    'recoverPasswordExpires',
    'verifyAccountCode',
];

export const USER_SIMPLIFIED_FIELDS = [
    '_id',
    'username',
    'profile.firstName',
    'profile.lastName',
    'profilePicture',
    'bundleCount',
    'followingCount',
];

export const CONTACT_FIELDS = ['phone', 'email', 'website'];
export const BASIC_FIELDS = [
    '_id',
    'firstName',
    'lastName',
    'profilePicture',
    'username',
];

enum MediaType {
    img = 'IMG',
    jpg = 'JPG',
    avg = 'AVG',
    vid = 'VIDEO',
}

enum Role {
    Creator = 'CREATOR', // Create new event
    Student = 'STUDENT', //
}

enum Sex {
    Male = 'MALE',
    Female = 'FEMALE',
}

enum StaffType {
    leader = 'LEADER',
    scanner = 'SCANNER',
    other = 'OTHER',
}

/**
 * Model User for both user account and admin account
 *
 * @attrinute _id is the primary key in ObjectID
 * @attribute createdAt is the time the Admin was created in miliseconds
 * @attribute username is used for log-in
 * @attribute password will be encrypted for log-in
 * @attribute role is the role to distinguish between user and admin
 * @attribute email is the email of the admin
 * @attribute phone is the phone number of the admin
 * @attribute address is the address of the admin
 * @attribute name is the name of the admin
 * @attribute description is the description for the profile of the admin
 * @attribute profilePicture is the object contain the picture for the admin
 * @attribute postCreated is the list of post created by this account
 * @attribute eventCreated is the list of event created by this account
 * @attribute isActivated is used for checking whether the user account is online or not
 * @attribute isBan is used for checking whether the user account is banned or not
 * @attribute banReasons is history of reasons for banning
 * @attribute socialDay is the number of social days the student has
 * @attribute firstName is the first name of the user
 * @attribute lastName is the last name of the user
 * @attribute dob is the date of birth of the user in milisecond
 * @attribute gender is the gender of the user: Male or Female
 * @attribute classId is the class id of the user
 * @attribute mature is the mature that the user is studying
 * @attribute studentId is the id of the student
 * @attribute studentCard is the object contain the picture for the student card
 * @attribute eventStaff is the list of event that the user staff for
 * @attribute eventRegister is the list of event that the user register
 */

export interface User {
    /* Account */
    _id: ObjectID;
    createdAt: number;
    username: string;
    password: string;
    role: Role[];
    email: string;
    phone: string;
    address?: string;
    name: string;
    description?: string;
    profilePicture: {
        path: string;
        type: MediaType;
    };

    notify: {
        title: string;
        createdAt: number;
        serviceName: string;
    }[];

    /* Admin */
    postCreated?: ObjectID[];
    eventCreated?: ObjectID[];

    /* User */
    isActivated?: boolean;
    isBan?: boolean;
    banReason?: string;
    isVerified?: boolean;

    recoverPasswordCode?: string;
    recoverPasswordExpires?: number;
    verifyAccountCode?: string;

    socialDays?: number;
    firstName?: string;
    lastName?: string;
    dob?: number;
    gender?: Sex;
    classId?: string;
    mature?: string;
    studentId?: string;
    studentCard?: {
        path: string;
        type: MediaType;
    };
    eventStaff?: {
        attendAt?: number;
        socialDay: number;
        role: StaffType;
        eventId: ObjectID;
    }[];
    eventRegister?: {
        eventId: ObjectID;
        firstCheck?: number;
        secondCheck?: number;
        socialDay: number;
    }[];
}

export function fillDefaultUserValue(user: User): User {
    return _.merge(
        {
            createdAt: Math.floor(Date.now() / 1000),
            username: '',
            password: '',
            name: '',
            email: user.username,

            role: [Role.Student],

            isActivated: true,
            isBan: false,
            banReason: '',
            isVerified: true,

            profilePicture: { path: 'http:example.img', type: MediaType.img },
        },
        user,
    );
}

// export const PROFILE_KEYS = Object.keys(fillDefaultUserValue(null));
// export const CONTACT_KEYS = Object.keys(fillDefaultUserValue(null));

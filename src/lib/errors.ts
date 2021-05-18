export class ErrorUnauthorized extends Error {}

export class ErrorInvalidData extends Error {}

export class ErrorNotFound extends Error {}

// User error
export class ErrorUserInvalid extends Error {
    public static readonly code = 'user/invalid';
    message = 'Invalid User';
}

// Bundle error
export class ErrorBundleInvalid extends Error {
    public static readonly code = 'bundle/invalid';
    message = 'Invalid Bundle';
}

export class ErrorHomeInvalid extends Error {
    public static readonly code = 'home/invalid';
    message = 'Invalid Home';
}

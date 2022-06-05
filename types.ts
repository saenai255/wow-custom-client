export type byte_t = number & { _opaque: typeof byte_t }
declare const byte_t: unique symbol;

export type usize_t = number;
export const BIT_SIZE = 1;
export const BYTE_SIZE = 8 * BIT_SIZE;


export enum LoginServerResult {
    SUCCESS = 0x00,
    FAIL_UNK0 = 0x01,
    FAIL_UNK1 = 0x02,
    FAIL_BANNED = 0x03,
    FAIL_UNKNOWN_ACCOUNT = 0x04,
    FAIL_INCORRECT_PASSWORD = 0x05,
    FAIL_ALREADY_ONLINE = 0x06,
    FAIL_NO_TIME = 0x07,
    FAIL_DB_BUSY = 0x08,
    FAIL_VERSION_INVALID = 0x09,
    LOGIN_DOWNLOAD_FILE = 0x0A,
    FAIL_INVALID_SERVER = 0x0B,
    FAIL_SUSPENDED = 0x0C,
    FAIL_NO_ACCESS = 0x0D,
    SUCCESS_SURVEY = 0x0E,
    FAIL_PARENTAL_CONTROL = 0x0F,
    FAIL_LOCKED_ENFORCED = 0x10

}

export enum ClientCommandCode {
    CMD_AUTH_LOGON_CHALLENGE = 0x00
};

export enum ServerCommandCode {
    CMD_AUTH_LOGON_CHALLENGE = 0x00
};

export enum Endian {
    LITTLE,
    BIG
}

export interface ServerAuthLogonChallenge {
    commandCode: ServerCommandCode;
    result: LoginServerResult;
    serverPublicKey: Buffer;
    generator: Buffer;
    largeSafePrime: Buffer;
    salt: Buffer;
    crcSalt: Buffer;
    twoFactorAuthEnabled: boolean;
}

import { clog } from "../log";
import { byte_t, Endian, LoginServerResult, ServerAuthLogonChallenge, ServerCommandCode } from "../types";

const offset = {
    opcode: [0x0, 0x1],
    protocolVersion: [0x1, 0x2],
    result: [0x2, 0x3],
    serverPublicKey: [0x3, 0x23],
    generatorLen: [0x23, 0x24],
    generator: [0x24, 0x25],
    largeSafePrimeLen: [0x25, 0x26],
    largeSafePrime: [0x26, 0x46],
    salt: [0x46, 0x66],
    crcSalt: [0x66, 0x76],
    twoFactorAuthEnabled: [0x76, 0x77]
}

const extractByteArray = ([start, end]: number[], buffer: Buffer, endianness: Endian): byte_t[] => {
    const out: byte_t[] = [];

    for (let idx = start; idx < end; idx++) {
        out.push(buffer.readUInt8(idx) as byte_t);
    }

    if (endianness === Endian.LITTLE) {
        return out.reverse();
    }

    return out;
}

export const parseServerAuthLogonChallenge = (buffer: Buffer): ServerAuthLogonChallenge => {
    const opcode = extractByteArray(offset.opcode, buffer, Endian.BIG)[0];
    const result = extractByteArray(offset.result, buffer, Endian.BIG)[0];
    const serverPublicKey = extractByteArray(offset.serverPublicKey, buffer, Endian.LITTLE);
    const generator = extractByteArray(offset.generator, buffer, Endian.BIG);
    const largeSafePrime = extractByteArray(offset.largeSafePrime, buffer, Endian.LITTLE);
    const salt = extractByteArray(offset.salt, buffer, Endian.LITTLE);
    const crcSalt = extractByteArray(offset.crcSalt, buffer, Endian.LITTLE);
    const twoFactorAuthEnabled = extractByteArray(offset.twoFactorAuthEnabled, buffer, Endian.BIG)[0];

    return {
        commandCode: opcode as ServerCommandCode,
        result: result as LoginServerResult,
        serverPublicKey: serverPublicKey.buffer(),
        crcSalt: crcSalt.buffer(),
        generator: generator.buffer(),
        largeSafePrime: largeSafePrime.buffer(),
        salt: salt.buffer(),
        twoFactorAuthEnabled: twoFactorAuthEnabled === 1
    }
}


export const assertServerAcceptsChallenge = (data: ServerAuthLogonChallenge): void | never => {
    clog.assert('server accepts logon challenge', data.result === LoginServerResult.SUCCESS, {
        actual: LoginServerResult[data.result],
        expected: LoginServerResult[LoginServerResult.SUCCESS]
    });
}

/*
0000   00 00 00 4a e0 08 55 b0 e4 c4 f0 10 d1 2e 55 b3
0010   bd d7 7a c6 2b 10 d0 79 2e 44 75 49 65 38 28 47
0020   c8 52 14 01 07 20 b7 9b 3e 2a 87 82 3c ab 8f 5e
0030   bf bf 8e b1 01 08 53 50 06 29 8b 5b ad bd 5b 53
0040   e1 89 5e 64 4b 89 7f 1c 34 97 9f 25 0a f1 90 88
0050   08 1d 5b 1b 2c 18 1f e7 89 a6 03 0b cd c3 86 87
0060   30 f0 7c fa 4e cd 21 0f 77 13 1d ce 65 21 59 03
0070   93 50 cd 8f 97 a7 00
       || || || || || || || || || || || || || || || ||
       00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15


*/
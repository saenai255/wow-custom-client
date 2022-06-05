import ByteArray from "../byte-array";
import { GAME_NAME, VERSION__5_4_8, BUILD_18414, PLATFORM_X86, OS_WINDOWS, LOCALE_ENUS, TIMEZONE_BIAS_2H, IP_LOCALHOST, PROTOCOL_VERSION_POST_BC } from "../constants";
import { Endian, BYTE_SIZE, ClientCommandCode } from "../types";

export const makeCommandAuthLogonChallenge = (accountName: string) => {
    const byteArray = new ByteArray();
    const accName = accountName.toUpperCase().bytes(Endian.BIG);
    const accNameLen = accName.length.byte()
    const packetSize = (GAME_NAME.length +
        VERSION__5_4_8.length +
        BUILD_18414.length +
        PLATFORM_X86.length +
        OS_WINDOWS.length +
        LOCALE_ENUS.length +
        TIMEZONE_BIAS_2H.length +
        IP_LOCALHOST.length +
        1 + // account name length
        accName.length)
        .bytes(2 * BYTE_SIZE, Endian.LITTLE);

    return byteArray
        .appendByte(ClientCommandCode.CMD_AUTH_LOGON_CHALLENGE)
        .appendBytes(PROTOCOL_VERSION_POST_BC)
        .appendBytes(packetSize)
        .appendBytes(GAME_NAME)
        .appendBytes(VERSION__5_4_8)
        .appendBytes(BUILD_18414)
        .appendBytes(PLATFORM_X86)
        .appendBytes(OS_WINDOWS)
        .appendBytes(LOCALE_ENUS)
        .appendBytes(TIMEZONE_BIAS_2H)
        .appendBytes(IP_LOCALHOST)
        .appendByte(accNameLen)
        .appendBytes(accName)
}
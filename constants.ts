import './monkey-patch';

import { BYTE_SIZE, Endian } from "./types";

export const PROTOCOL_VERSION_POST_BC = [0x08]
export const GAME_NAME = "WoW".cStr().bytes(Endian.BIG)
export const VERSION__5_4_8 = [5, 4, 8];
export const BUILD_18414 = (18414).bytes(2 * BYTE_SIZE, Endian.LITTLE)
export const PLATFORM_X86 = "x86".bytes(Endian.LITTLE).cStr()
export const OS_WINDOWS = "Win".bytes(Endian.LITTLE).cStr()
export const LOCALE_ENUS = "enUS".bytes(Endian.LITTLE)
export const TIMEZONE_BIAS_2H = (120).bytes(4 * BYTE_SIZE, Endian.BIG)
export const IP_LOCALHOST = [127, 0, 0, 1]
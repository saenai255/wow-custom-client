import './monkey-patch';

import { Socket } from "net";
import ByteArray from "./byte-array";
import { ServerCommandCode } from "./types";

export const expectServerPacket = (socket: Socket, command: ServerCommandCode) => {
    let ok = null, raise = null;
    const out = new Promise<Buffer>((resolve, reject) => {
        ok = resolve;
        raise = reject;
    });

    setTimeout(() => raise(`Timeout. Expected server command ${ServerCommandCode[command]}`), 5000)

    const listenOnce = () => {
        socket.once('data', data => {
            const cmd = data.readUInt8();
            if (cmd === command) {
                ok(data)
            } else {
                listenOnce()
            }
        });
    }

    listenOnce();

    return out
}

export const sendPacket = (socket: Socket, bytes: ByteArray): Promise<void> =>
    new Promise<void>((resolve, reject) =>
        socket.write(bytes.data, err => err ? reject(err) : resolve()))


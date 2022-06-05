import { Socket, SocketConnectOpts } from 'net'
import { promisify } from 'util';
import { clog } from '../log';



export const connect = async (realmlist: string): Promise<Socket> => {
    const socket = new Socket()
    const socketConnect = promisify((opts: SocketConnectOpts, cb: () => void) => socket.connect(opts, cb))

    socket.once('close', hadErr => {
        console.log(hadErr ? 'Exited with error' : 'Exited normally.')
        process.exit(hadErr ? 1 : 0);
    });

    await clog.fn('establish', 'server connection', () => socketConnect({
        host: realmlist,
        port: 3724
    }));

    return socket;
}
//192.168.0.227
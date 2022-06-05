import { makeCommandAuthLogonChallenge } from './auth/client-logon-challenge';
import { assertServerAcceptsChallenge, parseServerAuthLogonChallenge } from './auth/server-logon-challenge';
import { clog, slog } from './log';
import './monkey-patch';
import { connect } from './socket/socket';
import { ServerCommandCode } from './types';
import { expectServerPacket, sendPacket } from './utils';


const main = async () => {
    const socket = await connect('192.168.0.227');

    const logonChallengePacket = makeCommandAuthLogonChallenge('admin')

    await clog.fn('send', 'auth logon challenge', () =>
        sendPacket(socket, logonChallengePacket));

    const serverAuthLogonChallengeResponse = await slog.fn('wait', 'for server logon challenge', () =>
        expectServerPacket(socket, ServerCommandCode.CMD_AUTH_LOGON_CHALLENGE)
            .then(parseServerAuthLogonChallenge));
    assertServerAcceptsChallenge(serverAuthLogonChallengeResponse);


}

main()
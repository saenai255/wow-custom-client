import { createHash } from 'crypto'
import * as bigIntBuffer from 'bigint-buffer'
import { modPow } from 'bigint-mod-arith';
import { clog } from "../log";

const N = Buffer.from([0xb7, 0x9b, 0x3e, 0x2a, 0x87, 0x82, 0x3c, 0xab, 0x8f, 0x5e, 0xbf, 0xbf, 0x8e, 0xb1, 0x01, 0x08, 0x53, 0x50, 0x06, 0x29, 0x8b, 0x5b, 0xad, 0xbd, 0x5b, 0x53, 0xe1, 0x89, 0x5e, 0x64, 0x4b, 0x89])
const B = Buffer.from([0x56, 0xfe, 0x38, 0x00, 0xfb, 0xca, 0x84, 0x99, 0xeb, 0xec, 0x12, 0x1f, 0x85, 0xb8, 0x5b, 0x9a, 0xbc, 0x1b, 0x5a, 0xeb, 0x7f, 0xd1, 0xba, 0x8d, 0xdb, 0x9a, 0xbd, 0x97, 0x04, 0x1c, 0x67, 0x3f])
const g = Buffer.from([0x07])
const s = Buffer.from([0x7f, 0x1c, 0x34, 0x97, 0x9f, 0x25, 0x0a, 0xf1, 0x90, 0x88, 0x08, 0x1d, 0x5b, 0x1b, 0x2c, 0x18, 0x1f, 0xe7, 0x89, 0xa6, 0x03, 0x0b, 0xcd, 0xc3, 0x86, 0x87, 0x30, 0xf0, 0x7c, 0xfa, 0x4e, 0xcd])
const I = Buffer.from('ADMIN')
const P = Buffer.from('ADMIN')

const genServerSRPParams = (sLittle: Buffer, g: Buffer, IBig: Buffer, PBig: Buffer, BLittle: Buffer, NLittle: Buffer) => {
    const B = bigIntBuffer.toBigIntLE(BLittle);
    const N = bigIntBuffer.toBigIntLE(NLittle);

    const a = BigInt(Math.floor(Math.random() * 15) + 1);
    const A = modPow(bigIntBuffer.toBigIntBE(g), a, N);//(g ** a) % N;

    clog.assert('A % N != 0', A % N !== 0n, {
        expected: 0n,
        actual: A % N,
    });

    const u = createHash('sha1').update(Buffer.concat([bigIntBuffer.toBufferBE(A, 32), BLittle.reverse()])).digest();
    const k = createHash('sha1').update(Buffer.concat([NLittle.reverse(), g])).digest();
    const x = createHash('sha1').update(Buffer.concat([sLittle.reverse(), IBig, Buffer.from(':'), PBig])).digest()
    const M1 = modPow(
        (B - (
            bigIntBuffer.toBigIntBE(k) * modPow(bigIntBuffer.toBigIntBE(g), bigIntBuffer.toBigIntBE(x), N)
        )),
        (a + (
            bigIntBuffer.toBigIntBE(u) * bigIntBuffer.toBigIntBE(x))),
        N
    );
    console.log({
        A: bigIntBuffer.toBufferLE(A, 32),
        M1: bigIntBuffer.toBufferLE(M1, 20),
    })
}

const genServerSRPParams2 = (sLittle: Buffer, gBuf: Buffer, IBig: Buffer, PBig: Buffer, BLittle: Buffer, NLittle: Buffer) => {
    const B = bigIntBuffer.toBigIntLE(BLittle);
    const N = bigIntBuffer.toBigIntLE(NLittle);
    const g = bigIntBuffer.toBigIntBE(gBuf);
    const k = 3n;

    const a = BigInt(Math.floor(Math.random() * 15) + 1);
    const userHash = createHash('sha1').update(Buffer.concat([IBig, Buffer.from(':'), PBig])).digest();
    const xHash = createHash('sha1')
        .update(sLittle.reverse())
        .update(userHash)
        .digest();
    const x = bigIntBuffer.toBigIntLE(xHash);
    const v = modPow(g, x, N);
    const A = modPow(g, a, N)
    const uHash = createHash('sha1').update(Buffer.concat([bigIntBuffer.toBufferBE(A, 32), BLittle.reverse()])).digest();
    const u = bigIntBuffer.toBigIntLE(uHash.subarray(0, 20));
    const S = modPow((B - k * modPow(g, x, N)), (a + u * x), N);
    let sHash = bigIntBuffer.toBufferBE(S, 32)
    const S1 = sHash.filter((_, i) => i % 2 === 0);
    const S2 = sHash.filter((_, i) => i % 2 === 1);
    const S1Hash = createHash('sha1').update(S1).digest();
    const S2Hash = createHash('sha1').update(S2).digest();
    for (let i = 0; i < 20; i++) {
        sHash[i * 2] = S1Hash[i];
        sHash[i * 2 + 1] = S2Hash[i];
    }


    const nHash = createHash('sha1')
        .update(sLittle.reverse())
        .digest();
    const gHash = createHash('sha1').update(gBuf).digest();
    const ngHash = Buffer.alloc(20);
    for (let i = 0; i < 20; i++) {
        ngHash[i] = nHash[i] ^ gHash[i];
    }

    const tAcc = bigIntBuffer.toBigIntBE(I);
    const tNgHash = bigIntBuffer.toBigIntBE(ngHash);
    const M1Hash = createHash('sha1')
        .update(bigIntBuffer.toBufferBE(tNgHash, 20))
        .update(bigIntBuffer.toBufferBE(tAcc, I.byteLength))
        .update(sLittle.reverse())
        .update(bigIntBuffer.toBufferBE(A, 32))
        .update(bigIntBuffer.toBufferBE(B, 32))
        .update(sHash.subarray(0, 40))
        .digest();


    console.log({
        M1Hash: M1Hash.reverse().subarray(0, 20),
        A: bigIntBuffer.toBufferLE(A, 32),
    })
}

genServerSRPParams2(s, g, I, P, B, N)
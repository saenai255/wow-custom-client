import { BYTE_SIZE, byte_t, Endian, usize_t } from "./types";

declare global {
    interface String {
        reverse(): string;
        bytes(endianness: Endian): byte_t[];
        cStr(): string;
    }

    interface Number {
        byte(): byte_t;
        bytes(size: usize_t, endianness: Endian): byte_t[];
    }

    interface Array<T> {
        cStr: T extends byte_t ? (() => byte_t[]) : never
        toJSString: T extends byte_t ? (() => string) : never
        hex: T extends byte_t ? (() => string) : T extends number ? (() => string) : never
        buffer: T extends byte_t ? (() => Buffer) : T extends number ? (() => Buffer) : never
    }
}

String.prototype.reverse = function () {
    return (this as string).split('').reverse().join('')
};

Number.prototype.byte = function () {
    const self = this as number;

    if (self > 255 || self < 0) {
        throw new TypeError('Not a byte: ' + self);
    }

    return self as byte_t;
}

Array.prototype.hex = function () {
    const self = this as byte_t[]

    return self.map(ch => ch.toString(16)).join(' ');
}

Array.prototype.toJSString = function () {
    const self = this as byte_t[]

    return String.fromCharCode(...self);
}

Array.prototype.buffer = function () {
    const self = this as byte_t[]

    return Buffer.from(self)
}

Array.prototype.cStr = function () {
    const self = this as Array<byte_t>
    if (self.length === 0) {
        return [0x00 as byte_t]
    }

    const last = self[self.length - 1];
    if (last === (0x00 as byte_t)) {
        return self
    }

    return [...self, 0x00] as byte_t[];
}

String.prototype.bytes = function (endianness: Endian) {
    const out = (this as string).split('').map(ch => ch.charCodeAt(0))
    if (endianness === Endian.BIG) {
        return out.map(ch => ch.byte());
    }

    return out.reverse().map(ch => ch.byte());
};

String.prototype.cStr = function () {
    const self = this as string;
    if (self.endsWith("\0")) {
        return self
    }

    return self + "\0";
};

Number.prototype.bytes = function (size_t: usize_t, endianness: Endian) {
    const self = this as number;
    const hex = self.toString(16);
    const size = size_t / BYTE_SIZE;
    const actualSize = Math.ceil((hex.length / 2))

    if (actualSize > size) {
        throw new Error(`Cannot convert ${self} to byte[${size}]. Actual size is ${actualSize}`);
    }

    let hexstr = hex;
    let out: byte_t[] = [];
    while (hexstr.length > 0) {
        const byte = hexstr.substring(0, 2)
        out.push(parseInt(byte, 16) as byte_t)
        hexstr = hexstr.substring(2)
    }

    const zeropad = new Array(size - out.length).fill(0x00)
    out = [...zeropad, ...out]
    if (endianness === Endian.BIG) {
        return out;
    }

    return out.reverse();
}

module.exports = {}
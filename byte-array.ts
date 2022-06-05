export default class ByteArray {
    private buf = new Uint8Array()

    appendBytes(bytes: number[]): ByteArray {
        this.buf = new Uint8Array([...this.buf, ...bytes])
        return this;
    }

    appendByte(byte: number): ByteArray {
        return this.appendBytes([byte])
    }

    get data() {
        return this.buf as Readonly<Uint8Array>
    }

    get hex() {
        return [...this.buf].hex()
    }
}
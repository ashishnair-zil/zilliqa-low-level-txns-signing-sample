import { bytes } from '@zilliqa-js/util';
import pkg from '@zilliqa-js/proto';
const { ZilliqaMessage } = pkg;

export const encodeTransactionProto = (tx) => {
    const msg = {
        version: tx.version,
        nonce: tx.nonce || 0,
        // core protocol Schnorr expects lowercase, non-prefixed address.
        toaddr: bytes.hexToByteArray(tx.toAddr.replace('0x', '').toLowerCase()),
        senderpubkey: ZilliqaMessage.ByteArray.create({
            data: bytes.hexToByteArray(tx.pubKey || '00'),
        }),
        amount: ZilliqaMessage.ByteArray.create({
            data: Uint8Array.from(tx.amount.toArrayLike(Buffer, undefined, 16)),
        }),
        gasprice: ZilliqaMessage.ByteArray.create({
            data: Uint8Array.from(tx.gasPrice.toArrayLike(Buffer, undefined, 16)),
        }),
        gaslimit: tx.gasLimit,
        code:
            tx.code && tx.code.length
                ? Uint8Array.from([...tx.code].map((c) => c.charCodeAt(0)))
                : null,
        data:
            tx.data && tx.data.length
                ? Uint8Array.from([...tx.data].map((c) => c.charCodeAt(0)))
                : null,
    };

    const serialised = ZilliqaMessage.ProtoTransactionCoreInfo.create(msg);

    return Buffer.from(
        ZilliqaMessage.ProtoTransactionCoreInfo.encode(serialised).finish(),
    );
};
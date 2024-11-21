/**
 * Converts a DER-encoded ECDSA signature to a fixed 64-byte length format.
 *
 * @param derSignature - The DER-encoded ECDSA signature (Uint8Array).
 * @returns A 64-byte fixed-length signature (Uint8Array).
 */
export const convertDerToFixed64 = (derSignature: Uint8Array): Uint8Array => {
  if (derSignature[0] !== 0x30) {
    throw new Error("Invalid DER signature format.");
  }

  // Read the total length of the sequence (second byte)
  const totalLength = derSignature[1] & 0xff;
  let offset = 2;

  // Parse the `r` component
  if (derSignature[offset] !== 0x02) {
    throw new Error("Invalid DER signature format for r component.");
  }
  const rLength = derSignature[offset + 1];
  let r = derSignature.slice(offset + 2, offset + 2 + (rLength & 0xff));
  offset += 2 + rLength;

  // Parse the `s` component
  if (derSignature[offset] !== 0x02) {
    throw new Error("Invalid DER signature format for s component.");
  }
  const sLength = derSignature[offset + 1];
  let s = derSignature.slice(offset + 2, offset + 2 + (sLength & 0xff));

  if (r[0] === 0x00) {
    r = r.slice(1);
  }

  if (s[0] === 0x00) {
    s = s.slice(1);
  }

  // Pad r and s to 32 bytes if they are less than 32 bytes long
  if (r.length > 32) {
    throw new Error("Invalid length for r component.");
  }

  if (s.length > 32) {
    throw new Error("Invalid length for s component.");
  }

  const rPadded = new Uint8Array(32);
  const sPadded = new Uint8Array(32);
  rPadded.set(r, 32 - r.length);
  sPadded.set(s, 32 - s.length);

  // Concatenate r and s into a 64-byte buffer
  const fixed64Signature = new Uint8Array(64);
  fixed64Signature.set(rPadded, 0);
  fixed64Signature.set(sPadded, 32);

  return fixed64Signature;
}


// Avoid ambiguous characters (0/O, 1/I) so passkeys are easy to read and type.
const PASSKEY_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generatePasskeyCandidate(length = 8): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += PASSKEY_CHARS[Math.floor(Math.random() * PASSKEY_CHARS.length)];
  }
  return result;
}

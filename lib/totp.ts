import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

const ISSUER = "Rutabien";

export function generateTotpSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

function buildTotp(email: string, secretBase32: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
}

export async function getTotpSetupQrCode(email: string, secretBase32: string): Promise<{ uri: string; qrCodeDataUrl: string }> {
  const uri = buildTotp(email, secretBase32).toString();
  const qrCodeDataUrl = await QRCode.toDataURL(uri, { margin: 1, width: 240 });
  return { uri, qrCodeDataUrl };
}

// window: 1 tolerates one 30s step of clock drift either side, standard
// practice for TOTP - too wide and it starts accepting stale/replayed codes.
export function verifyTotpCode(email: string, secretBase32: string, code: string): boolean {
  const delta = buildTotp(email, secretBase32).validate({ token: code, window: 1 });
  return delta !== null;
}

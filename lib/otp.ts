import bcrypt from "bcryptjs";

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;

/** Génère un code OTP à 6 chiffres. */
export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export async function verifyOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export function otpExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}

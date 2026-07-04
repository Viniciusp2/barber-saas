import { prisma } from "@/lib/prisma";
import { sendWhatsappOtp } from "@/lib/whatsapp";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

/**
 * Normaliza um telefone brasileiro para um formato consistente (+55DDDNUMERO).
 * Simplificado para o MVP: assume Brasil quando não há código de país.
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  return `+${withCountryCode}`;
}

function generateCode(): string {
  return Math.floor(Math.random() * 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0");
}

export async function requestPhoneOtp(
  rawPhone: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const phone = normalizePhone(rawPhone);

  const recentCode = await prisma.phoneOtp.findFirst({
    where: { phone, createdAt: { gte: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) } },
    orderBy: { createdAt: "desc" },
  });

  if (recentCode) {
    return { ok: false, error: "Aguarde um pouco antes de pedir um novo código." };
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

  await prisma.phoneOtp.create({ data: { phone, code, expiresAt } });
  await sendWhatsappOtp(phone, code);

  return { ok: true };
}

export async function verifyPhoneOtp(rawPhone: string, code: string): Promise<boolean> {
  const phone = normalizePhone(rawPhone);

  const otp = await prisma.phoneOtp.findFirst({
    where: { phone, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return false;
  if (otp.expiresAt < new Date()) return false;
  if (otp.attempts >= MAX_ATTEMPTS) return false;

  if (otp.code !== code) {
    await prisma.phoneOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return false;
  }

  await prisma.phoneOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  return true;
}

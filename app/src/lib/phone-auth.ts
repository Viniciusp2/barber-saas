import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendWhatsappMagicLink } from "@/lib/whatsapp";

const LINK_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Normaliza um telefone brasileiro para um formato consistente (+55DDDNUMERO).
 * Simplificado para o MVP: assume Brasil quando não há código de país.
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  return `+${withCountryCode}`;
}

/** Formata um telefone normalizado (+55DDDNUMERO) para exibição: (DD) 9XXXX-XXXX. */
export function formatPhoneDisplay(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "").replace(/^55/, "");
  if (digits.length !== 11 && digits.length !== 10) return rawPhone;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  const splitAt = rest.length - 4;
  return `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`;
}

function generateToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function requestPhoneMagicLink(
  rawPhone: string,
  name: string,
  redirectTo: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const phone = normalizePhone(rawPhone);

  const recent = await prisma.phoneLoginToken.findFirst({
    where: { phone, createdAt: { gte: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) } },
    orderBy: { createdAt: "desc" },
  });

  if (recent) {
    return { ok: false, error: "Aguarde um pouco antes de pedir um novo link." };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + LINK_TTL_MINUTES * 60_000);

  await prisma.phoneLoginToken.create({ data: { phone, token, name, expiresAt } });

  const baseUrl =
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const magicUrl = `${baseUrl}/api/magic-login?token=${token}&next=${encodeURIComponent(redirectTo)}`;
  await sendWhatsappMagicLink(phone, magicUrl);

  return { ok: true };
}

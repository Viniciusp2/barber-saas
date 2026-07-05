/**
 * Normaliza um telefone brasileiro para um formato consistente (+55DDDNUMERO).
 * Simplificado para o MVP: assume Brasil quando não há código de país.
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  return `+${withCountryCode}`;
}

/**
 * Normaliza um número de WhatsApp para E.164 só com dígitos (sem "+"), ex:
 * "5591982220024". Usado para montar links wa.me. Retorna null se, depois
 * de normalizado, tiver menos de 12 dígitos (DDI+DDD+número mínimo).
 */
export function normalizeWhatsappDigits(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  if (withCountryCode.length < 12) {
    return null;
  }
  return withCountryCode;
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


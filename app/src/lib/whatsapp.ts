/**
 * Envio de mensagens via WhatsApp — hoje mockado (loga no console).
 * Quando houver um provedor configurado (Twilio, Meta Cloud API etc.),
 * troque a implementação aqui; o resto do app chama só `sendWhatsappMessage`.
 */
export async function sendWhatsappMessage(phone: string, message: string): Promise<void> {
  console.log(`[WhatsApp mock] Para ${phone}: ${message}`);
}

export async function sendWhatsappOtp(phone: string, code: string): Promise<void> {
  await sendWhatsappMessage(
    phone,
    `Seu código de verificação Barber SaaS é ${code}. Ele expira em 10 minutos.`
  );
}

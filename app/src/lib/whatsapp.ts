import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Envio de mensagens via WhatsApp. Usa a Twilio quando TWILIO_ACCOUNT_SID e
 * TWILIO_AUTH_TOKEN estão configurados no .env; caso contrário, cai para um
 * mock que só loga no console (útil em dev sem credenciais).
 */
export async function sendWhatsappMessage(phone: string, message: string): Promise<void> {
  if (!client || !fromNumber) {
    console.log(`[WhatsApp mock] Para ${phone}: ${message}`);
    return;
  }

  await client.messages.create({
    from: fromNumber,
    to: `whatsapp:${phone}`,
    body: message,
  });
}

export async function sendWhatsappMagicLink(phone: string, url: string): Promise<void> {
  await sendWhatsappMessage(
    phone,
    `Toque no link pra confirmar seu agendamento: ${url}\nO link expira em 10 minutos.`
  );
}

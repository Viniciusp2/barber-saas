"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBarbershop } from "@/lib/get-current-barbershop";
import { normalizeWhatsappDigits } from "@/lib/phone-auth";

const schema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  phone: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  whatsappNumber: z.string().optional(),
  timezone: z.string().min(1),
});

export async function updateBarbershop(formData: FormData) {
  const { barbershop } = await requireBarbershop();

  const data = schema.parse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    description: formData.get("description") || undefined,
    whatsappNumber: formData.get("whatsappNumber") || undefined,
    timezone: formData.get("timezone"),
  });

  const autoConfirmAppointments = formData.get("autoConfirmAppointments") === "on";

  let whatsappNumber: string | null = null;
  if (data.whatsappNumber) {
    whatsappNumber = normalizeWhatsappDigits(data.whatsappNumber);
    if (!whatsappNumber) {
      throw new Error(
        "Número de WhatsApp inválido — confira o DDD e o número (mínimo 12 dígitos com o 55)."
      );
    }
  }

  await prisma.barbershop.update({
    where: { id: barbershop.id },
    data: {
      name: data.name,
      phone: data.phone,
      address: data.address,
      description: data.description,
      timezone: data.timezone,
      whatsappNumber,
      autoConfirmAppointments,
    },
  });

  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard");
}

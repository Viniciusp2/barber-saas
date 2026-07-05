"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone-auth";
import { getAvailableSlots, formatLocalDateString } from "@/lib/availability";

interface BookingUrlParams {
  serviceId?: string;
  staffId?: string;
  date?: string;
  slot?: string;
  name?: string;
  phone?: string;
  error?: string;
}

function buildBookingUrl(barbershopId: string, params: BookingUrlParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return `/barbearia/${barbershopId}${query ? `?${query}` : ""}`;
}

const createAppointmentSchema = z.object({
  barbershopId: z.string().min(1),
  staffId: z.string().min(1),
  serviceId: z.string().min(1),
  slot: z.string().min(1),
});

export async function createAppointmentAction(formData: FormData) {
  const session = await auth();

  const parsed = createAppointmentSchema.safeParse({
    barbershopId: formData.get("barbershopId"),
    staffId: formData.get("staffId"),
    serviceId: formData.get("serviceId"),
    slot: formData.get("slot"),
  });

  if (!parsed.success) {
    throw new Error("Dados de agendamento inválidos.");
  }

  const { barbershopId, staffId, serviceId, slot } = parsed.data;
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  let clientId: string;

  if (session?.user) {
    clientId = session.user.id;
  } else {
    if (!name || !phone) {
      redirect(
        buildBookingUrl(barbershopId, {
          serviceId,
          staffId,
          date: formatLocalDateString(new Date(slot)),
          slot,
          name,
          phone,
          error: "dados_invalidos",
        })
      );
    }

    const normalizedPhone = normalizePhone(phone);
    const guest = await prisma.user.upsert({
      where: { phone: normalizedPhone },
      update: { name },
      create: { phone: normalizedPhone, name, role: "USER" },
    });
    clientId = guest.id;
  }

  const startDate = new Date(slot);

  const availableSlots = await getAvailableSlots(staffId, serviceId, startDate);
  const stillAvailable = availableSlots.some((s) => s.start.getTime() === startDate.getTime());

  if (!stillAvailable) {
    redirect(
      buildBookingUrl(barbershopId, {
        serviceId,
        staffId,
        date: formatLocalDateString(startDate),
        error: "slot_indisponivel",
      })
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      clientId,
      staffId,
      serviceId,
      barbershopId,
      date: startDate,
      status: "PENDING",
    },
  });

  redirect(`/agendamento/${appointment.id}`);
}

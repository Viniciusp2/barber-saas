"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requestPhoneMagicLink } from "@/lib/phone-auth";
import { getAvailableSlots, formatLocalDateString } from "@/lib/availability";

interface BookingUrlParams {
  serviceId?: string;
  staffId?: string;
  date?: string;
  slot?: string;
  name?: string;
  phone?: string;
  sent?: string;
  error?: string;
  success?: string;
  appointmentId?: string;
}

function buildBookingUrl(barbershopId: string, params: BookingUrlParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return `/barbearia/${barbershopId}${query ? `?${query}` : ""}`;
}

function readBaseParams(formData: FormData) {
  return {
    barbershopId: String(formData.get("barbershopId") ?? ""),
    serviceId: String(formData.get("serviceId") ?? ""),
    staffId: String(formData.get("staffId") ?? ""),
    date: String(formData.get("date") ?? ""),
    slot: String(formData.get("slot") ?? ""),
  };
}

export async function requestMagicLinkAction(formData: FormData) {
  const { barbershopId, serviceId, staffId, date, slot } = readBaseParams(formData);
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const base = { serviceId, staffId, date, slot, name, phone };

  if (!name || !phone) {
    redirect(buildBookingUrl(barbershopId, { ...base, error: "dados_invalidos" }));
  }

  const redirectTo = buildBookingUrl(barbershopId, { serviceId, staffId, date, slot });
  const result = await requestPhoneMagicLink(phone, name, redirectTo);

  if (!result.ok) {
    redirect(buildBookingUrl(barbershopId, { ...base, error: "link_aguarde" }));
  }

  redirect(buildBookingUrl(barbershopId, { ...base, sent: "1" }));
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

  if (!session?.user) {
    redirect(buildBookingUrl(barbershopId, { serviceId, staffId, slot }));
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
      clientId: session.user.id,
      staffId,
      serviceId,
      barbershopId,
      date: startDate,
      status: "PENDING",
    },
  });

  redirect(buildBookingUrl(barbershopId, { success: "1", appointmentId: appointment.id }));
}

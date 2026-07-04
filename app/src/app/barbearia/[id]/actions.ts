"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requestPhoneOtp } from "@/lib/phone-otp";
import { getAvailableSlots, formatLocalDateString } from "@/lib/availability";

interface BookingUrlParams {
  serviceId?: string;
  staffId?: string;
  date?: string;
  slot?: string;
  name?: string;
  phone?: string;
  otp?: string;
  error?: string;
  success?: string;
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

export async function requestOtpAction(formData: FormData) {
  const { barbershopId, serviceId, staffId, date, slot } = readBaseParams(formData);
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !phone) {
    redirect(
      buildBookingUrl(barbershopId, { serviceId, staffId, date, slot, name, phone, error: "dados_invalidos" })
    );
  }

  const result = await requestPhoneOtp(phone);

  if (!result.ok) {
    redirect(
      buildBookingUrl(barbershopId, { serviceId, staffId, date, slot, name, phone, error: "otp_aguarde" })
    );
  }

  redirect(buildBookingUrl(barbershopId, { serviceId, staffId, date, slot, name, phone, otp: "1" }));
}

export async function verifyOtpAction(formData: FormData) {
  const { barbershopId, serviceId, staffId, date, slot } = readBaseParams(formData);
  const name = String(formData.get("name") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const code = String(formData.get("code") ?? "");

  try {
    await signIn("phone-otp", {
      phone,
      code,
      name,
      redirectTo: buildBookingUrl(barbershopId, { serviceId, staffId, date, slot }),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(
        buildBookingUrl(barbershopId, {
          serviceId,
          staffId,
          date,
          slot,
          name,
          phone,
          otp: "1",
          error: "otp_invalido",
        })
      );
    }
    throw error;
  }
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

  await prisma.appointment.create({
    data: {
      clientId: session.user.id,
      staffId,
      serviceId,
      barbershopId,
      date: startDate,
      status: "PENDING",
    },
  });

  redirect(buildBookingUrl(barbershopId, { success: "1" }));
}

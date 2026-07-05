"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function cancelMyAppointment(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  await prisma.appointment.updateMany({
    where: { id, status: { in: ["PENDING", "CONFIRMED"] } },
    data: { status: "CANCELLED" },
  });

  redirect(`/agendamento/${id}`);
}

export async function rescheduleMyAppointment(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    redirect("/");
  }

  await prisma.appointment.updateMany({
    where: { id, status: { in: ["PENDING", "CONFIRMED"] } },
    data: { status: "CANCELLED" },
  });

  const params = new URLSearchParams({
    serviceId: appointment.serviceId,
    staffId: appointment.staffId,
  });

  redirect(`/barbearia/${appointment.barbershopId}?${params.toString()}`);
}

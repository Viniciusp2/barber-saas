"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBarbershop } from "@/lib/get-current-barbershop";

export async function confirmAppointment(formData: FormData) {
  const { barbershop } = await requireBarbershop();
  const id = String(formData.get("id") ?? "");

  await prisma.appointment.updateMany({
    where: { id, barbershopId: barbershop.id },
    data: { status: "CONFIRMED" },
  });

  revalidatePath("/dashboard/agendamentos");
  revalidatePath("/dashboard");
}

export async function cancelAppointment(formData: FormData) {
  const { barbershop } = await requireBarbershop();
  const id = String(formData.get("id") ?? "");

  await prisma.appointment.updateMany({
    where: { id, barbershopId: barbershop.id },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/dashboard/agendamentos");
  revalidatePath("/dashboard");
}

"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBarbershop } from "@/lib/get-current-barbershop";

const schema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  avatar: z.string().url("URL inválida").optional().or(z.literal("")),
  daysOff: z.array(z.coerce.number().int().min(0).max(6)),
});

function parseStaffForm(formData: FormData) {
  const parsed = schema.parse({
    name: formData.get("name"),
    avatar: formData.get("avatar") || undefined,
    daysOff: formData.getAll("daysOff"),
  });

  return { name: parsed.name, avatar: parsed.avatar || null, daysOff: parsed.daysOff };
}

export async function createStaff(formData: FormData) {
  const { barbershop } = await requireBarbershop();
  const data = parseStaffForm(formData);

  await prisma.staff.create({
    data: { ...data, barbershopId: barbershop.id },
  });

  revalidatePath("/dashboard/equipe");
  redirect("/dashboard/equipe");
}

export async function updateStaff(id: string, formData: FormData) {
  const { barbershop } = await requireBarbershop();
  const data = parseStaffForm(formData);

  await prisma.staff.updateMany({
    where: { id, barbershopId: barbershop.id },
    data,
  });

  revalidatePath("/dashboard/equipe");
  redirect("/dashboard/equipe");
}

export async function deleteStaff(formData: FormData) {
  const { barbershop } = await requireBarbershop();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.staff.deleteMany({
    where: { id, barbershopId: barbershop.id },
  });

  revalidatePath("/dashboard/equipe");
}

const timeOffSchema = z
  .object({
    staffId: z.string().min(1),
    date: z.string().min(1, "Escolha uma data"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
    reason: z.string().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "O horário final precisa ser depois do inicial",
    path: ["endTime"],
  });

function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

export async function createTimeOff(formData: FormData) {
  const { barbershop } = await requireBarbershop();

  const parsed = timeOffSchema.parse({
    staffId: formData.get("staffId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    reason: formData.get("reason") || undefined,
  });

  const staff = await prisma.staff.findFirst({
    where: { id: parsed.staffId, barbershopId: barbershop.id },
  });
  if (!staff) {
    throw new Error("Barbeiro não encontrado.");
  }

  await prisma.staffTimeOff.create({
    data: {
      staffId: staff.id,
      startAt: combineDateAndTime(parsed.date, parsed.startTime),
      endAt: combineDateAndTime(parsed.date, parsed.endTime),
      reason: parsed.reason,
    },
  });

  revalidatePath(`/dashboard/equipe/${staff.id}/editar`);
}

export async function deleteTimeOff(formData: FormData) {
  const { barbershop } = await requireBarbershop();
  const id = formData.get("id");
  const staffId = formData.get("staffId");
  if (typeof id !== "string" || typeof staffId !== "string") return;

  await prisma.staffTimeOff.deleteMany({
    where: { id, staff: { barbershopId: barbershop.id } },
  });

  revalidatePath(`/dashboard/equipe/${staffId}/editar`);
}

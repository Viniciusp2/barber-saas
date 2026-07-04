"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBarbershop } from "@/lib/get-current-barbershop";

const schema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  avatar: z.string().url("URL inválida").optional().or(z.literal("")),
});

function parseStaffForm(formData: FormData) {
  const parsed = schema.parse({
    name: formData.get("name"),
    avatar: formData.get("avatar") || undefined,
  });

  return { name: parsed.name, avatar: parsed.avatar || null };
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

"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBarbershop } from "@/lib/get-current-barbershop";

const schema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  description: z.string().optional(),
  durationMin: z.coerce.number().int().positive("Duração precisa ser maior que zero"),
  price: z.coerce.number().nonnegative("Preço não pode ser negativo"),
});

function parseServiceForm(formData: FormData) {
  return schema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    durationMin: formData.get("durationMin"),
    price: formData.get("price"),
  });
}

export async function createService(formData: FormData) {
  const { barbershop } = await requireBarbershop();
  const data = parseServiceForm(formData);

  await prisma.service.create({
    data: { ...data, barbershopId: barbershop.id },
  });

  revalidatePath("/dashboard/servicos");
  redirect("/dashboard/servicos");
}

export async function updateService(id: string, formData: FormData) {
  const { barbershop } = await requireBarbershop();
  const data = parseServiceForm(formData);

  await prisma.service.updateMany({
    where: { id, barbershopId: barbershop.id },
    data,
  });

  revalidatePath("/dashboard/servicos");
  redirect("/dashboard/servicos");
}

export async function deleteService(formData: FormData) {
  const { barbershop } = await requireBarbershop();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.service.deleteMany({
    where: { id, barbershopId: barbershop.id },
  });

  revalidatePath("/dashboard/servicos");
}

"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBarbershop } from "@/lib/get-current-barbershop";

const schema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  phone: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

export async function updateBarbershop(formData: FormData) {
  const { barbershop } = await requireBarbershop();

  const data = schema.parse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    description: formData.get("description") || undefined,
  });

  await prisma.barbershop.update({
    where: { id: barbershop.id },
    data,
  });

  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard");
}

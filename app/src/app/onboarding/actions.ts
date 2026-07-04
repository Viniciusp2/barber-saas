"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function createBarbershop(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const parsed = schema.parse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
  });

  await prisma.$transaction([
    prisma.barbershop.create({
      data: {
        name: parsed.name,
        phone: parsed.phone,
        address: parsed.address,
        ownerId: session.user.id,
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { role: "OWNER" },
    }),
  ]);

  redirect("/dashboard");
}

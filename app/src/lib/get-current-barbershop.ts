import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireBarbershop() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const barbershop = await prisma.barbershop.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!barbershop) {
    redirect("/onboarding");
  }

  return { session, barbershop };
}

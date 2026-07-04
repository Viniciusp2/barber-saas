import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBarbershop } from "./actions";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const existing = await prisma.barbershop.findFirst({
    where: { ownerId: session.user.id },
  });
  if (existing) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <div>
        <span className="font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Quase lá
        </span>
        <h1 className="mt-2 font-display text-2xl font-semibold">
          Crie sua barbearia
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esses dados aparecem para os seus clientes e podem ser alterados depois
          em Configurações.
        </p>
      </div>

      <form action={createBarbershop} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Nome da barbearia
          </label>
          <Input id="name" name="name" required placeholder="Barbearia do Zé" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium">
            Telefone
          </label>
          <Input id="phone" name="phone" placeholder="(11) 99999-9999" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="address" className="text-sm font-medium">
            Endereço
          </label>
          <Input id="address" name="address" placeholder="Rua Exemplo, 123" />
        </div>

        <Button type="submit" size="lg" className="mt-2">
          Criar barbearia
        </Button>
      </form>
    </div>
  );
}

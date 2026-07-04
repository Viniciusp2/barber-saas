import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
        Barber SaaS
      </span>
      <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Agendamento online e gestão completa para barbearias
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Organize horários, serviços e equipe em um só lugar. Em construção — o
        painel abaixo já mostra por onde a plataforma vai evoluir.
      </p>
      <Link href="/dashboard" className="mt-8">
        <Button size="lg">Acessar painel</Button>
      </Link>
    </div>
  );
}

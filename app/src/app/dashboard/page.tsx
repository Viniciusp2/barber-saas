import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireBarbershop } from "@/lib/get-current-barbershop";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { barbershop } = await requireBarbershop();

  const [servicesCount, staffCount] = await Promise.all([
    prisma.service.count({ where: { barbershopId: barbershop.id } }),
    prisma.staff.count({ where: { barbershopId: barbershop.id } }),
  ]);

  const stats = [
    { label: "Agendamentos hoje", value: "0" },
    { label: "Serviços cadastrados", value: String(servicesCount) },
    { label: "Membros da equipe", value: String(staffCount) },
    { label: "Taxa de ocupação", value: "0%" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Visão geral</h1>
        <p className="text-sm text-muted-foreground">
          Resumo da {barbershop.name}. Os números de agendamento ficam ativos a
          partir da Fase 4.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos agendamentos</CardTitle>
          <CardDescription>
            Nenhum agendamento por aqui ainda — essa lista será alimentada quando o
            fluxo de agendamento (Fase 4) estiver pronto.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

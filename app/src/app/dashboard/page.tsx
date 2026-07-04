import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireBarbershop } from "@/lib/get-current-barbershop";
import { prisma } from "@/lib/prisma";

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
};

const statusClasses: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  CONFIRMED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-red-500/15 text-red-700 dark:text-red-400",
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default async function DashboardPage() {
  const { barbershop } = await requireBarbershop();

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const todayLabel = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const [servicesCount, staffCount, pendingCount, todayAppointments] = await Promise.all([
    prisma.service.count({ where: { barbershopId: barbershop.id } }),
    prisma.staff.count({ where: { barbershopId: barbershop.id } }),
    prisma.appointment.count({
      where: { barbershopId: barbershop.id, status: "PENDING" },
    }),
    prisma.appointment.findMany({
      where: {
        barbershopId: barbershop.id,
        date: { gte: todayStart, lte: todayEnd },
        status: { not: "CANCELLED" },
      },
      include: { client: true, service: true, staff: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const stats = [
    { label: "Agendamentos hoje", value: String(todayAppointments.length) },
    { label: "Agendamentos pendentes", value: String(pendingCount) },
    { label: "Serviços cadastrados", value: String(servicesCount) },
    { label: "Membros da equipe", value: String(staffCount) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Visão geral</h1>
        <p className="text-sm text-muted-foreground">Resumo da {barbershop.name}.</p>
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
          <CardTitle className="capitalize">Agenda de hoje · {todayLabel}</CardTitle>
          {todayAppointments.length === 0 && (
            <CardDescription>
              Nenhum agendamento pra hoje ainda. Compartilhe o link público da sua
              barbearia para os clientes começarem a agendar.
            </CardDescription>
          )}
        </CardHeader>
        {todayAppointments.length > 0 && (
          <div className="flex flex-col divide-y divide-border px-6 pb-6">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-14 shrink-0 font-medium">
                    {formatTime(appointment.date)}
                  </span>
                  <div>
                    <p className="font-medium">
                      {appointment.client.name ?? appointment.client.phone ?? "Cliente"}
                    </p>
                    <p className="text-muted-foreground">
                      {appointment.service.name} com {appointment.staff.name}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[appointment.status]}`}
                >
                  {statusLabels[appointment.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

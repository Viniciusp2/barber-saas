import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireBarbershop } from "@/lib/get-current-barbershop";
import { prisma } from "@/lib/prisma";
import { confirmAppointment, cancelAppointment, completeAppointment } from "./agendamentos/actions";
import {
  IconCalendar,
  IconScissors,
  IconUsers,
  IconAlertCircle,
  IconPlus,
} from "@/components/dashboard/icons";

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Concluído",
};

const statusClasses: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  CONFIRMED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-red-500/15 text-red-700 dark:text-red-400",
  COMPLETED: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function initialsOf(name: string | null) {
  return (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export default async function DashboardPage() {
  const { session, barbershop } = await requireBarbershop();

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

  const [servicesCount, staffCount, pendingAppointments, todayAppointments] = await Promise.all([
    prisma.service.count({ where: { barbershopId: barbershop.id } }),
    prisma.staff.count({ where: { barbershopId: barbershop.id } }),
    prisma.appointment.findMany({
      where: { barbershopId: barbershop.id, status: "PENDING" },
      include: { client: true, service: true, staff: true },
      orderBy: { date: "asc" },
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

  const firstName = session.user.name?.split(" ")[0] ?? "";

  const stats = [
    { label: "Agendamentos hoje", value: todayAppointments.length, icon: IconCalendar },
    { label: "Pendentes", value: pendingAppointments.length, icon: IconAlertCircle },
    { label: "Serviços cadastrados", value: servicesCount, icon: IconScissors },
    { label: "Membros da equipe", value: staffCount, icon: IconUsers },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          Olá{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Aqui está o resumo da {barbershop.name} hoje.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/dashboard/servicos/novo">
          <Button variant="outline" size="sm">
            <IconPlus className="size-4" />
            Novo serviço
          </Button>
        </Link>
        <Link href="/dashboard/equipe/novo">
          <Button variant="outline" size="sm">
            <IconPlus className="size-4" />
            Novo membro
          </Button>
        </Link>
      </div>

      {pendingAppointments.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <IconAlertCircle className="size-5" />
              <CardTitle className="text-amber-700 dark:text-amber-400">
                {pendingAppointments.length === 1
                  ? "1 agendamento esperando confirmação"
                  : `${pendingAppointments.length} agendamentos esperando confirmação`}
              </CardTitle>
            </div>
          </CardHeader>
          <div className="flex flex-col divide-y divide-border px-6 pb-6">
            {pendingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {formatTime(appointment.date)} ·{" "}
                    {appointment.client.name ?? appointment.client.phone ?? "Cliente"}
                  </p>
                  <p className="text-muted-foreground">
                    {appointment.service.name} com {appointment.staff.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={confirmAppointment}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <Button type="submit" size="sm">
                      Confirmar
                    </Button>
                  </form>
                  <form action={cancelAppointment}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      Cancelar
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <stat.icon className="size-4" />
                </span>
                <div>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-2xl">{stat.value}</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda de hoje · {todayLabel}</CardTitle>
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
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <Link
                  href={`/agendamento/${appointment.id}`}
                  className="flex flex-1 items-center gap-3 hover:opacity-75"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                    {initialsOf(appointment.client.name)}
                  </span>
                  <div>
                    <p className="font-medium">
                      {formatTime(appointment.date)} ·{" "}
                      {appointment.client.name ?? appointment.client.phone ?? "Cliente"}
                    </p>
                    <p className="text-muted-foreground">
                      {appointment.service.name} com {appointment.staff.name}
                    </p>
                  </div>
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[appointment.status]}`}
                  >
                    {statusLabels[appointment.status]}
                  </span>
                  {appointment.status === "CONFIRMED" && (
                    <form action={completeAppointment}>
                      <input type="hidden" name="id" value={appointment.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Marcar como feito
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

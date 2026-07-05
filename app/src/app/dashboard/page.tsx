import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart } from "@/components/dashboard/bar-chart";
import { requireBarbershop } from "@/lib/get-current-barbershop";
import { prisma } from "@/lib/prisma";
import { formatLocalDateString } from "@/lib/availability";
import {
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  confirmAllAppointments,
} from "./agendamentos/actions";
import {
  IconCalendar,
  IconScissors,
  IconUsers,
  IconAlertCircle,
  IconPlus,
  IconTrendingUp,
} from "@/components/dashboard/icons";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatCurrencyCompact(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

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

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const chartDays = 7;
  const chartStart = new Date(todayStart);
  chartStart.setDate(chartStart.getDate() - (chartDays - 1));

  const [
    servicesCount,
    staffCount,
    pendingAppointments,
    todayAppointments,
    monthRevenueAppointments,
    chartAppointments,
  ] = await Promise.all([
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
    prisma.appointment.findMany({
      where: {
        barbershopId: barbershop.id,
        date: { gte: monthStart, lte: monthEnd },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      include: { service: true },
    }),
    prisma.appointment.findMany({
      where: {
        barbershopId: barbershop.id,
        date: { gte: chartStart, lte: todayEnd },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      include: { service: true },
    }),
  ]);

  const monthRevenue = monthRevenueAppointments.reduce((sum, a) => sum + a.service.price, 0);

  const revenueByDay = new Map<string, number>();
  for (let i = 0; i < chartDays; i++) {
    const d = new Date(chartStart);
    d.setDate(d.getDate() + i);
    revenueByDay.set(formatLocalDateString(d), 0);
  }
  for (const appointment of chartAppointments) {
    const key = formatLocalDateString(appointment.date);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + appointment.service.price);
  }
  const chartData = Array.from(revenueByDay.entries()).map(([date, value]) => ({
    label: new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short" }),
    value,
  }));

  const firstName = session.user.name?.split(" ")[0] ?? "";

  const stats = [
    { label: "Faturamento do mês", value: formatCurrency(monthRevenue), icon: IconTrendingUp },
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <IconAlertCircle className="size-5" />
                <CardTitle className="text-amber-700 dark:text-amber-400">
                  {pendingAppointments.length === 1
                    ? "1 agendamento esperando confirmação"
                    : `${pendingAppointments.length} agendamentos esperando confirmação`}
                </CardTitle>
              </div>
              {pendingAppointments.length > 1 && (
                <form action={confirmAllAppointments}>
                  <Button type="submit" variant="outline" size="sm">
                    Confirmar todos
                  </Button>
                </form>
              )}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <stat.icon className="size-4" />
                </span>
                <div>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-xl">{stat.value}</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faturamento · últimos {chartDays} dias</CardTitle>
          <CardDescription>
            Considera agendamentos Confirmados e Concluídos (pendentes e cancelados não entram).
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <BarChart data={chartData} formatValue={formatCurrencyCompact} />
        </div>
      </Card>

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

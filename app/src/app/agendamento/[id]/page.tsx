import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteButton } from "@/components/ui/delete-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cancelMyAppointment, rescheduleMyAppointment } from "./actions";
import { IconCalendar, IconMapPin, IconCheckCircle } from "../../barbearia/[id]/icons";

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

function daysUntil(date: Date): number {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86_400_000);
}

function countdownLabel(status: string, days: number): string {
  if (status === "CANCELLED") return "Agendamento cancelado";
  if (status === "COMPLETED") return "Atendimento concluído";
  if (days > 1) return `Faltam ${days} dias`;
  if (days === 1) return "Falta 1 dia";
  if (days === 0) return "É hoje!";
  return "Esse atendimento já passou";
}

export default async function AgendamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { client: true, staff: true, service: true, barbershop: true },
  });

  if (!appointment) {
    notFound();
  }

  const { barbershop, service, staff, client } = appointment;
  const start = appointment.date;
  const end = new Date(start.getTime() + service.durationMin * 60_000);

  const googleCalendarUrl = buildGoogleCalendarUrl({
    uid: `appointment-${appointment.id}@barber-saas`,
    title: `${service.name} — ${barbershop.name}`,
    description: `Agendamento com ${staff.name} na ${barbershop.name}.`,
    location: barbershop.address ?? barbershop.name,
    start,
    end,
  });

  const mapsUrl = barbershop.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${barbershop.address}, ${barbershop.name}`)}`
    : null;

  const days = daysUntil(start);
  const canManage = appointment.status === "PENDING" || appointment.status === "CONFIRMED";
  const initials = (client.name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="relative min-h-screen">
      <div className="absolute right-4 top-4 z-10">
        <ThemeSwitcher />
      </div>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center gap-4 px-6 py-12">
        <div className="animate-scale-in flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <IconCheckCircle className="size-8" />
        </div>

        <div className="animate-fade-in-up text-center" style={{ animationDelay: "0.1s" }}>
          <h1 className="font-display text-2xl font-semibold">Agendamento confirmado</h1>
          <p className="mt-1 text-sm text-muted-foreground">{countdownLabel(appointment.status, days)}</p>
        </div>

        <Card className="animate-fade-in-up w-full shadow-sm" style={{ animationDelay: "0.15s" }}>
          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                {initials || "?"}
              </span>
              <div>
                <p className="font-medium">{client.name ?? "Cliente"}</p>
                <p className="text-sm text-muted-foreground">{barbershop.name}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Serviço</span>
                <span className="text-right font-medium">
                  {service.name} · {service.durationMin} min
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Data</span>
                <span className="text-right font-medium capitalize">{formatDate(start)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Horário</span>
                <span className="text-right font-medium">{formatTime(start)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Valor</span>
                <span className="text-right font-medium">{formatPrice(service.price)}</span>
              </div>
              {barbershop.address && (
                <div className="flex items-center justify-between gap-4">
                  <span className="shrink-0 text-muted-foreground">Endereço</span>
                  <span className="text-right font-medium">{barbershop.address}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="animate-fade-in-up flex w-full flex-col gap-2" style={{ animationDelay: "0.2s" }}>
          <div className="flex gap-2">
            <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full">
                <IconCalendar className="size-4" />
                Adicionar à minha agenda
              </Button>
            </a>
          </div>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full">
                <IconMapPin className="size-4" />
                Como chegar
              </Button>
            </a>
          )}
        </div>

        {canManage && (
          <div
            className="animate-fade-in-up flex w-full items-center justify-center gap-2"
            style={{ animationDelay: "0.25s" }}
          >
            <form action={rescheduleMyAppointment} className="flex-1">
              <input type="hidden" name="id" value={appointment.id} />
              <Button type="submit" variant="ghost" size="sm" className="w-full">
                Remarcar
              </Button>
            </form>
            <div className="flex-1">
              <DeleteButton
                action={cancelMyAppointment}
                confirmMessage="Cancelar esse agendamento?"
                hiddenFields={{ id: appointment.id }}
                label="Cancelar"
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

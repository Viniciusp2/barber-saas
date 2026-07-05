import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getAvailableSlots,
  getAvailableSlotsForAnyStaff,
  parseLocalDateString,
  formatLocalDateString,
} from "@/lib/availability";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createAppointmentAction } from "./actions";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import {
  IconScissors,
  IconShuffle,
  IconCalendar,
  IconClock,
  IconWhatsapp,
  IconCheckCircle,
  IconMapPin,
} from "./icons";

interface SearchParams {
  serviceId?: string;
  staffId?: string;
  date?: string;
  slot?: string;
  name?: string;
  phone?: string;
  error?: string;
  success?: string;
  appointmentId?: string;
}

const errorMessages: Record<string, string> = {
  dados_invalidos: "Preencha nome e telefone.",
  slot_indisponivel: "Esse horário acabou de ser reservado por outra pessoa. Escolha outro.",
};

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

function periodLabel(hour: number) {
  if (hour < 12) return "Manhã";
  if (hour < 18) return "Tarde";
  return "Noite";
}

function buildLink(barbershopId: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  return `/barbearia/${barbershopId}?${search.toString()}`;
}

function StepBadge({ number, label, state }: { number: number; label: string; state: "done" | "active" | "todo" }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
          state === "done"
            ? "bg-primary text-primary-foreground"
            : state === "active"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
        }`}
      >
        {state === "done" ? <IconCheckCircle className="size-4" /> : number}
      </span>
      <span
        className={`hidden text-sm font-medium sm:block ${
          state === "todo" ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default async function BarbershopPublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const barbershop = await prisma.barbershop.findUnique({
    where: { id },
    include: {
      services: { orderBy: { name: "asc" } },
      staff: { orderBy: { name: "asc" } },
    },
  });

  if (!barbershop) {
    notFound();
  }

  if (sp.success) {
    const appointment = sp.appointmentId
      ? await prisma.appointment.findFirst({
          where: { id: sp.appointmentId, barbershopId: barbershop.id },
          include: { service: true, staff: true },
        })
      : null;

    let googleCalendarUrl: string | null = null;
    if (appointment) {
      const start = appointment.date;
      const end = new Date(start.getTime() + appointment.service.durationMin * 60_000);
      googleCalendarUrl = buildGoogleCalendarUrl({
        uid: `appointment-${appointment.id}@barber-saas`,
        title: `${appointment.service.name} — ${barbershop.name}`,
        description: `Agendamento com ${appointment.staff.name} na ${barbershop.name}.`,
        location: barbershop.address ?? barbershop.name,
        start,
        end,
      });
    }

    let whatsappUrl: string | null = null;
    if (barbershop.whatsappNumber) {
      const message = appointment
        ? `Olá! Acabei de agendar ${appointment.service.name} com ${appointment.staff.name} no dia ${formatDate(appointment.date)} às ${formatTime(appointment.date)}.`
        : `Olá! Acabei de agendar um horário na ${barbershop.name}.`;
      whatsappUrl = `https://wa.me/${barbershop.whatsappNumber}?text=${encodeURIComponent(message)}`;
    }

    return (
      <div className="theme-light-forced min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <div className="animate-scale-in flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <IconCheckCircle className="size-10" />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <span className="font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Tudo certo
            </span>
            <h1 className="mt-2 font-display text-2xl font-semibold">Agendamento confirmado!</h1>
            <p className="mt-2 text-muted-foreground">
              Assim que o barbeiro confirmar, você recebe um aviso. Obrigado por escolher a{" "}
              {barbershop.name}.
            </p>
          </div>

          {appointment && (
            <Card
              className="animate-fade-in-up w-full text-left shadow-sm"
              style={{ animationDelay: "0.25s" }}
            >
              <div className="flex flex-col gap-3 p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <IconCalendar className="size-4 text-primary" />
                  Adicionar à minha agenda
                </h2>
                <p className="text-xs text-muted-foreground">
                  Opcional — se preferir, é só fechar essa tela.
                </p>
                <div className="flex flex-wrap gap-2">
                  {googleCalendarUrl && (
                    <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        Google Agenda
                      </Button>
                    </a>
                  )}
                  <a href={`/api/appointments/${appointment.id}/ics`}>
                    <Button variant="outline" size="sm">
                      Baixar .ics (iPhone/Outlook)
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          )}

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="animate-fade-in-up flex items-center gap-2 text-sm text-emerald-600 underline"
              style={{ animationDelay: "0.3s" }}
            >
              <IconWhatsapp className="size-4" />
              Falar com a barbearia no WhatsApp
            </a>
          )}

          <Link
            href={`/barbearia/${barbershop.id}`}
            className="animate-fade-in-up"
            style={{ animationDelay: "0.35s" }}
          >
            <Button>Fazer outro agendamento</Button>
          </Link>
        </div>
      </div>
    );
  }

  const session = await auth();
  const hasSelection = Boolean(sp.serviceId && sp.staffId && sp.date);

  let slots: { start: Date; end: Date; staffId: string }[] = [];
  if (hasSelection && sp.serviceId && sp.staffId && sp.date) {
    try {
      const date = parseLocalDateString(sp.date);
      if (sp.staffId === "any") {
        slots = await getAvailableSlotsForAnyStaff(barbershop.id, sp.serviceId, date);
      } else {
        const staffId = sp.staffId;
        const plainSlots = await getAvailableSlots(staffId, sp.serviceId, date);
        slots = plainSlots.map((slot) => ({ ...slot, staffId }));
      }
    } catch {
      slots = [];
    }
  }

  const selectedSlot = sp.slot ? slots.find((s) => s.start.toISOString() === sp.slot) : undefined;
  const selectedService = sp.serviceId
    ? barbershop.services.find((s) => s.id === sp.serviceId)
    : undefined;

  const step = selectedSlot && selectedService ? 3 : hasSelection ? 2 : 1;

  const groupedSlots = slots.reduce<Record<string, typeof slots>>((groups, slot) => {
    const label = periodLabel(slot.start.getHours());
    (groups[label] ??= []).push(slot);
    return groups;
  }, {});

  return (
    <div className="theme-light-forced min-h-screen">
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-12 md:py-16">
        <header className="animate-fade-in-up text-center">
          <span className="font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Agende seu horário
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold">{barbershop.name}</h1>
          {(barbershop.address || barbershop.description) && (
            <div className="mt-3 flex flex-col items-center gap-1 text-sm text-muted-foreground">
              {barbershop.address && (
                <span className="flex items-center gap-1.5">
                  <IconMapPin className="size-4 text-primary" />
                  {barbershop.address}
                </span>
              )}
              {barbershop.description && <p className="max-w-md">{barbershop.description}</p>}
            </div>
          )}
        </header>

        <div
          className="animate-fade-in-up flex items-center justify-center gap-4 sm:gap-8"
          style={{ animationDelay: "0.05s" }}
        >
          <StepBadge number={1} label="Serviço" state={step > 1 ? "done" : "active"} />
          <span className="h-px w-8 bg-border sm:w-16" />
          <StepBadge number={2} label="Horário" state={step > 2 ? "done" : step === 2 ? "active" : "todo"} />
          <span className="h-px w-8 bg-border sm:w-16" />
          <StepBadge number={3} label="Confirmação" state={step === 3 ? "active" : "todo"} />
        </div>

        {sp.error && (
          <p className="animate-fade-in-up rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
            {errorMessages[sp.error] ?? "Algo deu errado."}
          </p>
        )}

        <Card className="animate-fade-in-up shadow-sm" style={{ animationDelay: "0.1s" }}>
          <form method="GET" className="flex flex-col gap-5 p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <IconScissors className="size-5 text-primary" />
              Serviço e barbeiro
            </h2>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Serviço</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {barbershop.services.map((service) => (
                  <label
                    key={service.id}
                    className="flex cursor-pointer flex-col gap-0.5 rounded-lg border border-border p-3 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5"
                  >
                    <input
                      type="radio"
                      name="serviceId"
                      value={service.id}
                      defaultChecked={sp.serviceId === service.id}
                      required
                      className="sr-only"
                    />
                    <span className="font-medium">{service.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {service.durationMin} min · {formatPrice(service.price)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Barbeiro</span>
              <div className="flex flex-wrap gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border py-1.5 pl-2 pr-3 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5">
                  <input
                    type="radio"
                    name="staffId"
                    value="any"
                    defaultChecked={sp.staffId === "any"}
                    required
                    className="sr-only"
                  />
                  <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <IconShuffle className="size-3.5" />
                  </span>
                  Qualquer um
                </label>
                {barbershop.staff.map((member) => (
                  <label
                    key={member.id}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-border py-1.5 pl-2 pr-3 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5"
                  >
                    <input
                      type="radio"
                      name="staffId"
                      value={member.id}
                      defaultChecked={sp.staffId === member.id}
                      required
                      className="sr-only"
                    />
                    <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                    {member.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="date" className="flex items-center gap-1.5 text-sm font-medium">
                <IconCalendar className="size-4 text-primary" />
                Data
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={sp.date}
                required
                min={formatLocalDateString(new Date())}
                suppressHydrationWarning
              />
            </div>

            <Button type="submit" size="lg">
              Ver horários disponíveis
            </Button>
          </form>
        </Card>

        {hasSelection && (
          <Card className="animate-fade-in-up shadow-sm">
            <div className="flex flex-col gap-4 p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <IconClock className="size-5 text-primary" />
                Escolha o horário
              </h2>
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum horário livre nesse dia. Tente outra data.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {Object.entries(groupedSlots).map(([label, periodSlots]) => (
                    <div key={label} className="flex flex-col gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {periodSlots.map((slotOption) => {
                          const isSelected = sp.slot === slotOption.start.toISOString();
                          const href = buildLink(barbershop.id, {
                            serviceId: sp.serviceId,
                            staffId: slotOption.staffId,
                            date: sp.date,
                            slot: slotOption.start.toISOString(),
                          });
                          return (
                            <Link key={slotOption.start.toISOString()} href={href}>
                              <Button variant={isSelected ? "primary" : "outline"} size="sm">
                                {formatTime(slotOption.start)}
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {selectedSlot && selectedService && (
          <Card className="animate-fade-in-up shadow-sm">
            <div className="flex flex-col gap-4 p-6">
              <h2 className="font-display text-lg font-semibold">Confirme seus dados</h2>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/60 p-3 text-sm">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <IconScissors className="size-4" />
                </span>
                <div>
                  <p className="font-medium">{selectedService.name}</p>
                  <p className="text-muted-foreground">
                    {formatDate(selectedSlot.start)} às {formatTime(selectedSlot.start)}
                  </p>
                </div>
              </div>

              <form action={createAppointmentAction} className="flex flex-col gap-3">
                <input type="hidden" name="barbershopId" value={barbershop.id} />
                <input type="hidden" name="staffId" value={selectedSlot.staffId} />
                <input type="hidden" name="serviceId" value={selectedService.id} />
                <input type="hidden" name="slot" value={selectedSlot.start.toISOString()} />

                {!session?.user && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="name" className="text-sm font-medium">
                        Nome
                      </label>
                      <Input id="name" name="name" required defaultValue={sp.name} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-medium">
                        <IconWhatsapp className="size-4 text-emerald-600" />
                        Telefone (WhatsApp)
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        required
                        defaultValue={sp.phone}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </>
                )}

                <Button type="submit" size="lg">
                  Confirmar agendamento
                </Button>
              </form>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

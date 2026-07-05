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
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createAppointmentAction } from "./actions";
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
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
          state === "done"
            ? "animate-bounce-in bg-primary bg-gradient-brand text-primary-foreground"
            : state === "active"
              ? "animate-pulse-ring bg-primary bg-gradient-brand text-primary-foreground"
              : "bg-secondary text-muted-foreground"
        }`}
      >
        {state === "done" ? <IconCheckCircle className="size-4" /> : number}
      </span>
      <span
        className={`hidden text-sm font-medium transition-colors sm:block ${
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

  let slotAnimIndex = 0;

  return (
    <div className="relative min-h-screen">
      <div className="absolute right-4 top-4 z-10">
        <ThemeSwitcher />
      </div>
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-12 md:py-16">
        <header className="animate-fade-in-up text-center">
          <span className="text-gradient-brand animate-gradient-move font-display text-sm font-medium uppercase tracking-[0.2em]">
            Agende seu horário
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold">{barbershop.name}</h1>
          {(barbershop.address || barbershop.description) && (
            <div className="mt-3 flex flex-col items-center gap-1 text-sm text-muted-foreground">
              {barbershop.address && (
                <span className="flex items-center gap-1.5">
                  <IconMapPin className="animate-float size-4 text-primary" />
                  {barbershop.address}
                </span>
              )}
              {barbershop.description && <p className="max-w-md">{barbershop.description}</p>}
            </div>
          )}
        </header>

        <div
          className="animate-fade-in-up flex items-center justify-center gap-4 sm:gap-8"
          style={{ animationDelay: "0.08s" }}
        >
          <StepBadge number={1} label="Serviço" state={step > 1 ? "done" : "active"} />
          <span className="h-px w-8 bg-border sm:w-16" />
          <StepBadge number={2} label="Horário" state={step > 2 ? "done" : step === 2 ? "active" : "todo"} />
          <span className="h-px w-8 bg-border sm:w-16" />
          <StepBadge number={3} label="Confirmação" state={step === 3 ? "active" : "todo"} />
        </div>

        {sp.error && (
          <p className="animate-bounce-in rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
            {errorMessages[sp.error] ?? "Algo deu errado."}
          </p>
        )}

        <Card className="animate-card-in shadow-sm" style={{ animationDelay: "0.12s" }}>
          <form method="GET" className="flex flex-col gap-5 p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <IconScissors className="size-5 text-primary" />
              Serviço e barbeiro
            </h2>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Serviço</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {barbershop.services.map((service, index) => (
                  <label
                    key={service.id}
                    style={{ animationDelay: `${0.15 + index * 0.04}s` }}
                    className="animate-fade-in-up flex cursor-pointer flex-col gap-0.5 rounded-lg border border-border p-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm has-checked:scale-[1.02] has-checked:border-primary has-checked:bg-primary/5 has-checked:shadow-sm"
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
                <label
                  style={{ animationDelay: "0.2s" }}
                  className="animate-fade-in-up flex cursor-pointer items-center gap-2 rounded-full border border-border py-1.5 pl-2 pr-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 has-checked:scale-[1.03] has-checked:border-primary has-checked:bg-primary/5 has-checked:shadow-sm"
                >
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
                {barbershop.staff.map((member, index) => (
                  <label
                    key={member.id}
                    style={{ animationDelay: `${0.24 + index * 0.04}s` }}
                    className="animate-fade-in-up flex cursor-pointer items-center gap-2 rounded-full border border-border py-1.5 pl-2 pr-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 has-checked:scale-[1.03] has-checked:border-primary has-checked:bg-primary/5 has-checked:shadow-sm"
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
          <Card className="animate-card-in shadow-sm">
            <div className="flex flex-col gap-4 p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <IconClock className="animate-float size-5 text-primary" />
                Escolha o horário
              </h2>
              {slots.length === 0 ? (
                <p className="animate-fade-in-up text-sm text-muted-foreground">
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
                          const delay = 0.02 * slotAnimIndex++;
                          return (
                            <Link
                              key={slotOption.start.toISOString()}
                              href={href}
                              className="animate-scale-in inline-block"
                              style={{ animationDelay: `${delay}s` }}
                            >
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
          <Card className="animate-card-in shadow-sm">
            <div className="flex flex-col gap-4 p-6">
              <h2 className="font-display text-lg font-semibold">Confirme seus dados</h2>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/60 p-3 text-sm">
                <span className="animate-bounce-in flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
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

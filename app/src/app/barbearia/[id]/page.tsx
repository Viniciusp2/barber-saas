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
import { requestOtpAction, verifyOtpAction, createAppointmentAction } from "./actions";

interface SearchParams {
  serviceId?: string;
  staffId?: string;
  date?: string;
  slot?: string;
  otp?: string;
  name?: string;
  phone?: string;
  error?: string;
  success?: string;
}

const errorMessages: Record<string, string> = {
  dados_invalidos: "Preencha nome e telefone.",
  otp_aguarde: "Aguarde um pouco antes de pedir um novo código.",
  otp_invalido: "Código inválido ou expirado.",
  slot_indisponivel: "Esse horário acabou de ser reservado por outra pessoa. Escolha outro.",
};

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

function buildLink(barbershopId: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  return `/barbearia/${barbershopId}?${search.toString()}`;
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
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Tudo certo
        </span>
        <h1 className="font-display text-2xl font-semibold">Agendamento confirmado!</h1>
        <p className="text-muted-foreground">
          Assim que o barbeiro confirmar, você recebe um aviso. Obrigado por escolher a{" "}
          {barbershop.name}.
        </p>
        <Link href={`/barbearia/${barbershop.id}`}>
          <Button>Fazer outro agendamento</Button>
        </Link>
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

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="font-display text-3xl font-semibold">{barbershop.name}</h1>
        {barbershop.address && <p className="text-muted-foreground">{barbershop.address}</p>}
        {barbershop.description && (
          <p className="mt-2 text-sm text-muted-foreground">{barbershop.description}</p>
        )}
      </div>

      {sp.error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {errorMessages[sp.error] ?? "Algo deu errado."}
        </p>
      )}

      <Card>
        <form method="GET" className="flex flex-col gap-4 p-6">
          <h2 className="font-display text-lg font-semibold">1. Serviço, barbeiro e data</h2>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="serviceId" className="text-sm font-medium">
              Serviço
            </label>
            <select
              id="serviceId"
              name="serviceId"
              defaultValue={sp.serviceId ?? ""}
              required
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="" disabled>
                Selecione
              </option>
              {barbershop.services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} — {service.durationMin} min — {formatPrice(service.price)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="staffId" className="text-sm font-medium">
              Barbeiro
            </label>
            <select
              id="staffId"
              name="staffId"
              defaultValue={sp.staffId ?? ""}
              required
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="" disabled>
                Selecione
              </option>
              <option value="any">Qualquer barbeiro disponível</option>
              {barbershop.staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="date" className="text-sm font-medium">
              Data
            </label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={sp.date}
              required
              min={formatLocalDateString(new Date())}
            />
          </div>

          <Button type="submit">Ver horários</Button>
        </form>
      </Card>

      {hasSelection && (
        <Card>
          <div className="flex flex-col gap-4 p-6">
            <h2 className="font-display text-lg font-semibold">2. Escolha o horário</h2>
            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum horário livre nesse dia. Tente outra data.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slotOption) => {
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
            )}
          </div>
        </Card>
      )}

      {selectedSlot && selectedService && (
        <Card>
          <div className="flex flex-col gap-4 p-6">
            <h2 className="font-display text-lg font-semibold">3. Confirme seus dados</h2>
            <p className="text-sm text-muted-foreground">
              {selectedService.name} às {formatTime(selectedSlot.start)} do dia{" "}
              {formatDate(selectedSlot.start)}
            </p>

            {session?.user ? (
              <form action={createAppointmentAction} className="flex flex-col gap-3">
                <input type="hidden" name="barbershopId" value={barbershop.id} />
                <input type="hidden" name="staffId" value={selectedSlot.staffId} />
                <input type="hidden" name="serviceId" value={selectedService.id} />
                <input type="hidden" name="slot" value={selectedSlot.start.toISOString()} />
                <Button type="submit" size="lg">
                  Confirmar agendamento
                </Button>
              </form>
            ) : sp.otp === "1" ? (
              <form action={verifyOtpAction} className="flex flex-col gap-3">
                <input type="hidden" name="barbershopId" value={barbershop.id} />
                <input type="hidden" name="staffId" value={selectedSlot.staffId} />
                <input type="hidden" name="serviceId" value={selectedService.id} />
                <input type="hidden" name="slot" value={selectedSlot.start.toISOString()} />
                <input type="hidden" name="name" value={sp.name ?? ""} />
                <input type="hidden" name="phone" value={sp.phone ?? ""} />
                <p className="text-sm text-muted-foreground">
                  Enviamos um código pro WhatsApp {sp.phone}.
                </p>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="code" className="text-sm font-medium">
                    Código
                  </label>
                  <Input id="code" name="code" required maxLength={6} />
                </div>
                <Button type="submit">Confirmar código</Button>
              </form>
            ) : (
              <form action={requestOtpAction} className="flex flex-col gap-3">
                <input type="hidden" name="barbershopId" value={barbershop.id} />
                <input type="hidden" name="staffId" value={selectedSlot.staffId} />
                <input type="hidden" name="serviceId" value={selectedService.id} />
                <input type="hidden" name="slot" value={selectedSlot.start.toISOString()} />
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nome
                  </label>
                  <Input id="name" name="name" required defaultValue={sp.name} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-sm font-medium">
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
                <Button type="submit">Receber código por WhatsApp</Button>
              </form>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

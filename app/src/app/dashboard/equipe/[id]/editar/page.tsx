import { notFound } from "next/navigation";
import { requireBarbershop } from "@/lib/get-current-barbershop";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteButton } from "@/components/ui/delete-button";
import { StaffForm } from "../../staff-form";
import { updateStaff, createTimeOff, deleteTimeOff } from "../../actions";

function formatRange(startAt: Date, endAt: Date) {
  const date = startAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const start = startAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const end = endAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${start}–${end}`;
}

export default async function EditarMembroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { barbershop } = await requireBarbershop();

  const member = await prisma.staff.findFirst({
    where: { id, barbershopId: barbershop.id },
  });

  if (!member) {
    notFound();
  }

  const timeOffs = await prisma.staffTimeOff.findMany({
    where: { staffId: member.id, endAt: { gte: new Date() } },
    orderBy: { startAt: "asc" },
  });

  const updateStaffWithId = updateStaff.bind(null, member.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Editar membro</h1>
        <p className="text-sm text-muted-foreground">{member.name}</p>
      </div>

      <StaffForm
        action={updateStaffWithId}
        submitLabel="Salvar alterações"
        defaultValues={member}
      />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Bloqueios de horário</CardTitle>
          <CardDescription>
            Use pra reservar uma folga pontual, começar mais tarde, fechar mais cedo ou
            estender o almoço em um dia específico.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {timeOffs.length > 0 && (
            <ul className="flex flex-col gap-2">
              {timeOffs.map((timeOff) => (
                <li
                  key={timeOff.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{formatRange(timeOff.startAt, timeOff.endAt)}</p>
                    {timeOff.reason && (
                      <p className="text-xs text-muted-foreground">{timeOff.reason}</p>
                    )}
                  </div>
                  <DeleteButton
                    action={deleteTimeOff}
                    confirmMessage="Remover esse bloqueio de horário?"
                    hiddenFields={{ id: timeOff.id, staffId: member.id }}
                  />
                </li>
              ))}
            </ul>
          )}

          <form action={createTimeOff} className="flex flex-col gap-3">
            <input type="hidden" name="staffId" value={member.id} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="date" className="text-sm font-medium">
                Data
              </label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="startTime" className="text-sm font-medium">
                  Início do bloqueio
                </label>
                <Input id="startTime" name="startTime" type="time" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="endTime" className="text-sm font-medium">
                  Fim do bloqueio
                </label>
                <Input id="endTime" name="endTime" type="time" required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reason" className="text-sm font-medium">
                Motivo (opcional)
              </label>
              <Input id="reason" name="reason" placeholder="Ex: almoço estendido, consulta médica..." />
            </div>
            <Button type="submit" variant="outline" className="self-start">
              Adicionar bloqueio
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

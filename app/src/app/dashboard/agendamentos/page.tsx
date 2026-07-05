import { requireBarbershop } from "@/lib/get-current-barbershop";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  confirmAllAppointments,
} from "./actions";

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

function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AgendamentosPage() {
  const { barbershop } = await requireBarbershop();

  const appointments = await prisma.appointment.findMany({
    where: { barbershopId: barbershop.id },
    include: { client: true, staff: true, service: true },
    orderBy: { date: "asc" },
  });

  const pendingCount = appointments.filter((a) => a.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Agendamentos</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe e gerencie os horários marcados na sua barbearia.
          </p>
        </div>
        {pendingCount > 1 && (
          <form action={confirmAllAppointments}>
            <Button type="submit" variant="outline" size="sm">
              Confirmar todos os pendentes ({pendingCount})
            </Button>
          </form>
        )}
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          title="Nenhum agendamento ainda"
          description="Compartilhe o link público da sua barbearia para os clientes começarem a agendar."
          actionLabel="Ver página pública"
          actionHref={`/barbearia/${barbershop.id}`}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Barbeiro</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-0 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="font-medium">
                  {appointment.client.name ?? appointment.client.phone ?? "Cliente"}
                  {appointment.client.phone && (
                    <div className="text-xs font-normal text-muted-foreground">
                      {appointment.client.phone}
                    </div>
                  )}
                </TableCell>
                <TableCell>{appointment.service.name}</TableCell>
                <TableCell>{appointment.staff.name}</TableCell>
                <TableCell>{formatDateTime(appointment.date)}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[appointment.status]}`}
                  >
                    {statusLabels[appointment.status]}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {appointment.status === "PENDING" && (
                      <form action={confirmAppointment}>
                        <input type="hidden" name="id" value={appointment.id} />
                        <Button type="submit" variant="ghost" size="sm">
                          Confirmar
                        </Button>
                      </form>
                    )}
                    {appointment.status === "CONFIRMED" && (
                      <form action={completeAppointment}>
                        <input type="hidden" name="id" value={appointment.id} />
                        <Button type="submit" variant="ghost" size="sm">
                          Marcar como feito
                        </Button>
                      </form>
                    )}
                    {(appointment.status === "PENDING" || appointment.status === "CONFIRMED") && (
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
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

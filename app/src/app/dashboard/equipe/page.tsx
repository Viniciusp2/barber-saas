import Link from "next/link";
import { requireBarbershop } from "@/lib/get-current-barbershop";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "@/components/ui/delete-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteStaff } from "./actions";

export default async function EquipePage() {
  const { barbershop } = await requireBarbershop();

  const staff = await prisma.staff.findMany({
    where: { barbershopId: barbershop.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Equipe</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os barbeiros vinculados à sua barbearia.
          </p>
        </div>
        <Link href="/dashboard/equipe/novo">
          <Button>Novo membro</Button>
        </Link>
      </div>

      {staff.length === 0 ? (
        <EmptyState
          title="Nenhum membro da equipe ainda"
          description="Cadastre o primeiro barbeiro da sua equipe para começar."
          actionLabel="Novo membro"
          actionHref="/dashboard/equipe/novo"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="w-0 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                    {member.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/dashboard/equipe/${member.id}/editar`}>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <DeleteButton
                      action={deleteStaff}
                      confirmMessage={`Remover "${member.name}" da equipe?`}
                      hiddenFields={{ id: member.id }}
                    />
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

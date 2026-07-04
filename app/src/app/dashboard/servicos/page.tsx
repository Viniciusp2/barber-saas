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
import { deleteService } from "./actions";

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ServicosPage() {
  const { barbershop } = await requireBarbershop();

  const services = await prisma.service.findMany({
    where: { barbershopId: barbershop.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Serviços</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre os serviços oferecidos, com duração e preço.
          </p>
        </div>
        <Link href="/dashboard/servicos/novo">
          <Button>Novo serviço</Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <EmptyState
          title="Nenhum serviço cadastrado"
          description="Cadastre o primeiro serviço da sua barbearia para começar."
          actionLabel="Novo serviço"
          actionHref="/dashboard/servicos/novo"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="w-0 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.durationMin} min</TableCell>
                <TableCell>{formatPrice(service.price)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/dashboard/servicos/${service.id}/editar`}>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <DeleteButton
                      action={deleteService}
                      confirmMessage={`Excluir o serviço "${service.name}"?`}
                      hiddenFields={{ id: service.id }}
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

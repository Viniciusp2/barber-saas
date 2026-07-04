import { notFound } from "next/navigation";
import { requireBarbershop } from "@/lib/get-current-barbershop";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "../../service-form";
import { updateService } from "../../actions";

export default async function EditarServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { barbershop } = await requireBarbershop();

  const service = await prisma.service.findFirst({
    where: { id, barbershopId: barbershop.id },
  });

  if (!service) {
    notFound();
  }

  const updateServiceWithId = updateService.bind(null, service.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Editar serviço</h1>
        <p className="text-sm text-muted-foreground">{service.name}</p>
      </div>

      <ServiceForm
        action={updateServiceWithId}
        submitLabel="Salvar alterações"
        defaultValues={service}
      />
    </div>
  );
}

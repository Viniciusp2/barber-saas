import { notFound } from "next/navigation";
import { requireBarbershop } from "@/lib/get-current-barbershop";
import { prisma } from "@/lib/prisma";
import { StaffForm } from "../../staff-form";
import { updateStaff } from "../../actions";

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
    </div>
  );
}

import { StaffForm } from "../staff-form";
import { createStaff } from "../actions";

export default function NovoMembroPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Novo membro da equipe</h1>
        <p className="text-sm text-muted-foreground">
          Adicione um barbeiro à sua equipe.
        </p>
      </div>

      <StaffForm action={createStaff} submitLabel="Adicionar membro" />
    </div>
  );
}

import { ServiceForm } from "../service-form";
import { createService } from "../actions";

export default function NovoServicoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Novo serviço</h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados do serviço oferecido pela sua barbearia.
        </p>
      </div>

      <ServiceForm action={createService} submitLabel="Criar serviço" />
    </div>
  );
}

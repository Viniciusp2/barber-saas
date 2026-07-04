import { requireBarbershop } from "@/lib/get-current-barbershop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBarbershop } from "./actions";

export default async function ConfiguracoesPage() {
  const { barbershop } = await requireBarbershop();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Dados da sua barbearia, visíveis para os clientes.
        </p>
      </div>

      <form action={updateBarbershop} className="flex max-w-lg flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Nome da barbearia
          </label>
          <Input id="name" name="name" required defaultValue={barbershop.name} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium">
            Telefone
          </label>
          <Input id="phone" name="phone" defaultValue={barbershop.phone ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="address" className="text-sm font-medium">
            Endereço
          </label>
          <Input id="address" name="address" defaultValue={barbershop.address ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-medium">
            Descrição
          </label>
          <Input
            id="description"
            name="description"
            defaultValue={barbershop.description ?? ""}
          />
        </div>

        <Button type="submit" className="mt-2 self-start">
          Salvar alterações
        </Button>
      </form>
    </div>
  );
}

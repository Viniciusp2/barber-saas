import { requireBarbershop } from "@/lib/get-current-barbershop";
import { formatPhoneDisplay } from "@/lib/phone-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBarbershop } from "./actions";

const timezones = [
  { value: "America/Sao_Paulo", label: "Brasília (UTC-3) — SP, RJ, MG, Sul..." },
  { value: "America/Belem", label: "Belém (UTC-3)" },
  { value: "America/Fortaleza", label: "Fortaleza (UTC-3)" },
  { value: "America/Recife", label: "Recife (UTC-3)" },
  { value: "America/Maceio", label: "Maceió (UTC-3)" },
  { value: "America/Bahia", label: "Salvador (UTC-3)" },
  { value: "America/Araguaina", label: "Araguaína (UTC-3)" },
  { value: "America/Manaus", label: "Manaus (UTC-4)" },
  { value: "America/Cuiaba", label: "Cuiabá (UTC-4)" },
  { value: "America/Campo_Grande", label: "Campo Grande (UTC-4)" },
  { value: "America/Porto_Velho", label: "Porto Velho (UTC-4)" },
  { value: "America/Boa_Vista", label: "Boa Vista (UTC-4)" },
  { value: "America/Rio_Branco", label: "Rio Branco (UTC-5)" },
  { value: "America/Noronha", label: "Fernando de Noronha (UTC-2)" },
];

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
          <label htmlFor="whatsappNumber" className="text-sm font-medium">
            WhatsApp (pra clientes chamarem depois do agendamento)
          </label>
          <Input
            id="whatsappNumber"
            name="whatsappNumber"
            placeholder="(91) 98222-0024"
            defaultValue={
              barbershop.whatsappNumber ? formatPhoneDisplay(barbershop.whatsappNumber) : ""
            }
          />
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="timezone" className="text-sm font-medium">
            Fuso horário
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={barbershop.timezone}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" className="mt-2 self-start">
          Salvar alterações
        </Button>
      </form>
    </div>
  );
}

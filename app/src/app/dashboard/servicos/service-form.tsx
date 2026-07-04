import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ServiceFormProps {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: {
    name: string;
    description: string | null;
    durationMin: number;
    price: number;
  };
  submitLabel: string;
}

export function ServiceForm({ action, defaultValues, submitLabel }: ServiceFormProps) {
  return (
    <form action={action} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Nome do serviço
        </label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Corte de cabelo"
          defaultValue={defaultValues?.name}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium">
          Descrição
        </label>
        <Input
          id="description"
          name="description"
          placeholder="Opcional"
          defaultValue={defaultValues?.description ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="durationMin" className="text-sm font-medium">
            Duração (min)
          </label>
          <Input
            id="durationMin"
            name="durationMin"
            type="number"
            min={1}
            required
            defaultValue={defaultValues?.durationMin}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="text-sm font-medium">
            Preço (R$)
          </label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={defaultValues?.price}
          />
        </div>
      </div>

      <div className="mt-2 flex gap-3">
        <Button type="submit">{submitLabel}</Button>
        <Link href="/dashboard/servicos">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  );
}

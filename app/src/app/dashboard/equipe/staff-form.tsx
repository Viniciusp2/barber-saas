import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StaffFormProps {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: {
    name: string;
    avatar: string | null;
  };
  submitLabel: string;
}

export function StaffForm({ action, defaultValues, submitLabel }: StaffFormProps) {
  return (
    <form action={action} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Nome do barbeiro
        </label>
        <Input
          id="name"
          name="name"
          required
          placeholder="João da Silva"
          defaultValue={defaultValues?.name}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="avatar" className="text-sm font-medium">
          Foto (URL)
        </label>
        <Input
          id="avatar"
          name="avatar"
          type="url"
          placeholder="Opcional"
          defaultValue={defaultValues?.avatar ?? ""}
        />
      </div>

      <div className="mt-2 flex gap-3">
        <Button type="submit">{submitLabel}</Button>
        <Link href="/dashboard/equipe">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  );
}

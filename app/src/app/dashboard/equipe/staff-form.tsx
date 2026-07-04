import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StaffFormProps {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: {
    name: string;
    avatar: string | null;
    daysOff: number[];
  };
  submitLabel: string;
}

const weekDays = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

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

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Dias de folga</span>
        <div className="flex flex-wrap gap-2">
          {weekDays.map((day) => (
            <label
              key={day.value}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm has-checked:border-primary has-checked:bg-primary/10"
            >
              <input
                type="checkbox"
                name="daysOff"
                value={day.value}
                defaultChecked={defaultValues?.daysOff.includes(day.value)}
                className="size-4 accent-primary"
              />
              {day.label}
            </label>
          ))}
        </div>
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

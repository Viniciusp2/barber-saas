import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WorkingHoursRow {
  weekday: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
}

interface StaffFormProps {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: {
    name: string;
    avatar: string | null;
  };
  /** Expediente atual (editar) ou vazio (novo membro). */
  workingHours?: WorkingHoursRow[];
  /** Usados como padrão de horário ao criar um novo membro. */
  defaultOpeningHour: number;
  defaultClosingHour: number;
  submitLabel: string;
}

const weekDays = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

function toTimeString(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function StaffForm({
  action,
  defaultValues,
  workingHours,
  defaultOpeningHour,
  defaultClosingHour,
  submitLabel,
}: StaffFormProps) {
  const hoursByWeekday = new Map(workingHours?.map((wh) => [wh.weekday, wh]));

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-6">
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

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Expediente</span>
        <p className="text-xs text-muted-foreground">
          Marque os dias em que ele trabalha e defina o horário. O intervalo (almoço) é opcional.
        </p>

        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {weekDays.map((day) => {
            const wh = hoursByWeekday.get(day.value);
            const isOpen = wh ? wh.isOpen : true;
            const startTime = wh?.startTime ?? toTimeString(defaultOpeningHour);
            const endTime = wh?.endTime ?? toTimeString(defaultClosingHour);

            return (
              <div key={day.value} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                <label className="flex w-32 shrink-0 cursor-pointer items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    name={`wh_${day.value}_isOpen`}
                    defaultChecked={isOpen}
                    className="size-4 accent-primary"
                  />
                  {day.label}
                </label>

                <div className="flex flex-1 flex-wrap items-center gap-2 text-sm">
                  <Input
                    type="time"
                    name={`wh_${day.value}_startTime`}
                    defaultValue={startTime}
                    className="w-28"
                  />
                  <span className="text-muted-foreground">até</span>
                  <Input
                    type="time"
                    name={`wh_${day.value}_endTime`}
                    defaultValue={endTime}
                    className="w-28"
                  />
                  <span className="ml-2 text-muted-foreground">Intervalo:</span>
                  <Input
                    type="time"
                    name={`wh_${day.value}_breakStart`}
                    defaultValue={wh?.breakStart ?? ""}
                    className="w-28"
                  />
                  <span className="text-muted-foreground">até</span>
                  <Input
                    type="time"
                    name={`wh_${day.value}_breakEnd`}
                    defaultValue={wh?.breakEnd ?? ""}
                    className="w-28"
                  />
                </div>
              </div>
            );
          })}
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

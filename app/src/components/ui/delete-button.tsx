"use client";

import { Button } from "./button";

interface DeleteButtonProps {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  hiddenFields?: Record<string, string>;
}

export function DeleteButton({ action, confirmMessage, hiddenFields }: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {hiddenFields &&
        Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
        Excluir
      </Button>
    </form>
  );
}

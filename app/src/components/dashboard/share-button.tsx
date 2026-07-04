"use client";

import { useState } from "react";
import { IconShare, IconCheck } from "./icons";

interface ShareButtonProps {
  barbershopId: string;
  barbershopName: string;
}

export function ShareButton({ barbershopId, barbershopName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/barbearia/${barbershopId}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: barbershopName, url });
        return;
      } catch {
        // usuário cancelou o compartilhamento nativo; cai para copiar o link
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
    >
      {copied ? (
        <>
          <IconCheck className="size-4 text-emerald-600" />
          Link copiado!
        </>
      ) : (
        <>
          <IconShare className="size-4" />
          Compartilhar
        </>
      )}
    </button>
  );
}

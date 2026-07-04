import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { credentialsSignIn } from "./actions";

const errorMessages: Record<string, string> = {
  credenciais_invalidas: "Email ou senha incorretos.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;

  if (session?.user) {
    redirect(callbackUrl || "/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <span className="font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Barber SaaS
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold">Entrar</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Acesse o painel para gerenciar sua barbearia.
        </p>
      </div>

      {error && (
        <p className="max-w-sm rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {errorMessages[error] ?? "Não foi possível entrar."}
        </p>
      )}

      <form action={credentialsSignIn} className="flex w-full max-w-sm flex-col gap-4 text-left">
        {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input id="email" name="email" type="email" required placeholder="voce@email.com" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Senha
          </label>
          <Input id="password" name="password" type="password" required />
        </div>

        <Button type="submit" size="lg" className="mt-2">
          Entrar
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-foreground underline">
          Cadastre-se
        </Link>
      </p>

      <div className="flex w-full max-w-sm items-center gap-3 text-xs uppercase text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: callbackUrl || "/dashboard" });
        }}
      >
        <Button type="submit" variant="outline" size="lg">
          Entrar com Google
        </Button>
      </form>
    </div>
  );
}

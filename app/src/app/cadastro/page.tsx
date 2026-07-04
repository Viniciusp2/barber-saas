import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "./actions";

const errorMessages: Record<string, string> = {
  dados_invalidos: "Confira os dados informados e tente novamente.",
  email_em_uso: "Esse email já está cadastrado. Tente entrar.",
};

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <span className="font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Barber SaaS
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold">Criar conta</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Cadastre-se com email e senha para gerenciar sua barbearia.
        </p>
      </div>

      {error && (
        <p className="max-w-sm rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {errorMessages[error] ?? "Não foi possível concluir o cadastro."}
        </p>
      )}

      <form action={signUp} className="flex w-full max-w-sm flex-col gap-4 text-left">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Nome
          </label>
          <Input id="name" name="name" required placeholder="Seu nome" />
        </div>

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
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirmar senha
          </label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
        </div>

        <Button type="submit" size="lg" className="mt-2">
          Criar conta
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-foreground underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

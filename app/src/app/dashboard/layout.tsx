import { signOut } from "@/auth";
import { requireBarbershop } from "@/lib/get-current-barbershop";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, barbershop } = await requireBarbershop();

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <DashboardShell
      barbershopId={barbershop.id}
      barbershopName={barbershop.name}
      userName={session.user.name ?? session.user.email ?? "Usuário"}
      roleLabel="Dono da barbearia"
      onSignOut={signOutAction}
    >
      {children}
    </DashboardShell>
  );
}

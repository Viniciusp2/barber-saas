import { IconMenu, IconLogout } from "./icons";
import { ShareButton } from "./share-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface HeaderProps {
  onMenuClick: () => void;
  userName: string;
  roleLabel: string;
  onSignOut: () => Promise<void>;
  barbershopId: string;
  barbershopName: string;
}

export function Header({
  onMenuClick,
  userName,
  roleLabel,
  onSignOut,
  barbershopId,
  barbershopName,
}: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-6">
      <button
        className="text-foreground md:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <IconMenu />
      </button>

      <ShareButton barbershopId={barbershopId} barbershopName={barbershopName} />

      <div className="flex items-center gap-3">
        <ThemeSwitcher className="hidden sm:flex" />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-none">{userName}</p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-medium">
          {userName.charAt(0).toUpperCase()}
        </div>
        <form action={onSignOut}>
          <button
            type="submit"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Sair"
            title="Sair"
          >
            <IconLogout />
          </button>
        </form>
      </div>
    </header>
  );
}

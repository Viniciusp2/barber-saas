import { IconMenu, IconLogout } from "./icons";

interface HeaderProps {
  onMenuClick: () => void;
  userName: string;
  roleLabel: string;
  onSignOut: () => Promise<void>;
}

export function Header({ onMenuClick, userName, roleLabel, onSignOut }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
      <button
        className="text-foreground md:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <IconMenu />
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <div className="text-right">
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

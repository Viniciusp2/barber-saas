"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  IconOverview,
  IconCalendar,
  IconScissors,
  IconUsers,
  IconSettings,
  IconClose,
} from "./icons";

const navItems = [
  { href: "/dashboard", label: "Visão geral", icon: IconOverview },
  { href: "/dashboard/agendamentos", label: "Agendamentos", icon: IconCalendar },
  { href: "/dashboard/servicos", label: "Serviços", icon: IconScissors },
  { href: "/dashboard/equipe", label: "Equipe", icon: IconUsers },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: IconSettings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  barbershopName: string;
}

export function Sidebar({ open, onClose, barbershopName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <span className="font-display text-xl font-semibold tracking-tight">
            Barber<span className="text-primary">SaaS</span>
          </span>
          <button
            className="text-sidebar-muted md:hidden"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <IconClose />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-active text-sidebar-foreground"
                    : "text-sidebar-muted hover:bg-sidebar-active hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="truncate border-t border-white/10 px-6 py-4 text-xs text-sidebar-muted">
          {barbershopName}
        </div>
      </aside>
    </>
  );
}

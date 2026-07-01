import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  Calculator,
  Home,
  LayoutDashboard,
  UserCircle,
} from "lucide-react";

const basePath = "/demo/template-immobilier";

const items = [
  { to: basePath, label: "Accueil", icon: Home },
  { to: `${basePath}#biens`, label: "Biens", icon: Building2 },
  { to: `${basePath}#estimation`, label: "Estimer", icon: Calculator },
  { to: `${basePath}/vendeur`, label: "Vendeur", icon: UserCircle },
  { to: `${basePath}/agent`, label: "Pro", icon: LayoutDashboard },
];

export function TemplateAppNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-black/5 bg-white/85 px-2 py-2 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.15)] backdrop-blur-xl">
        {items.map((it) => {
          const active =
            path === it.to ||
            (it.to !== basePath &&
              !it.to.includes("#") &&
              path.startsWith(it.to));
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-all ${
                active
                  ? "bg-brand-black text-white"
                  : "text-brand-gray hover:text-brand-black"
              }`}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

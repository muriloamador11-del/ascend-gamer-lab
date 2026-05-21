"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Gamepad2,
  Home,
  ListChecks,
  LogOut,
  PlusCircle,
  Target,
  UserCog,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

const hiddenRoutes = ["/", "/login", "/cadastro", "/privacidade", "/termos"];

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    match: (pathname: string) => pathname === "/dashboard",
  },
  {
    label: "Partidas",
    href: "/partidas",
    icon: BarChart3,
    match: (pathname: string) =>
      pathname === "/partidas" || /^\/partidas\/[^/]+$/.test(pathname),
  },
  {
    label: "Nova partida",
    href: "/partidas/nova",
    icon: PlusCircle,
    match: (pathname: string) => pathname === "/partidas/nova",
  },
  {
    label: "Metas",
    href: "/metas",
    icon: Target,
    match: (pathname: string) => pathname.startsWith("/metas"),
  },
  {
    label: "Editar perfil",
    href: "/onboarding",
    icon: UserCog,
    match: (pathname: string) => pathname === "/onboarding",
  },
  {
    label: "Conta",
    href: "/conta",
    icon: UserRound,
    match: (pathname: string) => pathname === "/conta",
  },
];

export function AppNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const shouldHide = hiddenRoutes.includes(pathname);

  if (shouldHide) {
    return null;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Você saiu da conta.");
    router.push("/login");
  }

  return (
    <>
      <aside className="fixed left-4 top-4 z-50 hidden h-[calc(100vh-2rem)] w-64 rounded-3xl border border-slate-200 bg-white/88 p-4 text-slate-900 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur xl:block">
        <div className="flex h-full flex-col">
          <Link href="/dashboard" className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50">
              <Gamepad2 className="h-6 w-6 text-sky-600" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Ascend Gamer Lab
              </p>
              <p className="text-xs text-slate-500">Competitive Coach</p>
            </div>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "border-sky-200 bg-sky-50 text-sky-700"
                      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-sky-600" : "text-slate-400"
                    }`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-sky-600" />
                <p className="text-sm font-semibold text-slate-900">
                  Fluxo atual
                </p>
              </div>

              <p className="text-xs leading-5 text-slate-500">
                Registre partidas, receba diagnóstico e transforme erro em meta
                prática.
              </p>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-4 left-4 right-4 z-50 rounded-3xl border border-slate-200 bg-white/95 p-2 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.10)] backdrop-blur xl:hidden">
        <div className="grid grid-cols-6 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.match(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[10px] transition ${
                  isActive
                    ? "bg-sky-50 text-sky-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`mb-1 h-4 w-4 ${
                    isActive ? "text-sky-600" : "text-slate-400"
                  }`}
                />
                <span className="line-clamp-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
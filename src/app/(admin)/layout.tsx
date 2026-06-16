"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Ticket,
  Gift,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Search,
  MessageSquare,
  Bell,
  UserCircle,
  ChevronDown,
  Mail,
  CheckCheck,
  LifeBuoy,
  Palette,
  ShieldCheck,
  User,
  Store,
} from "lucide-react";

import { isAuthenticated, clearTokens } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ApiHealthStatus } from "@/components/admin/ApiHealthStatus";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Menu", href: "/menu", icon: UtensilsCrossed },
  { label: "Vouchers", href: "/vouchers", icon: Ticket },
  { label: "Rewards", href: "/rewards", icon: Gift },
  { label: "Members", href: "/members", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [openQuickPanel, setOpenQuickPanel] = useState<"messages" | "notifications" | "settings" | "profile" | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  useEffect(() => {
    setIsNavigating(false);
    setSidebarOpen(false);
    setOpenQuickPanel(null);
  }, [pathname]);

  function handleLogout() {
    setIsNavigating(true);
    clearTokens();
    router.replace("/login");
  }

  function handleNavigate(href: string) {
    if (href !== pathname) {
      setIsNavigating(true);
    }
  }

  const activeItem = navItems.find((item) => item.href === pathname);

  // Show nothing while checking auth
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <LoadingState variant="page" label="Menyiapkan command center" rows={4} className="w-full max-w-md" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#ffe1f1_0%,transparent_34%),linear-gradient(135deg,#f7fbff_0%,#eaf7ff_48%,#d9f4ff_100%)] p-0 lg:p-6">
      {isNavigating && (
        <div className="fixed inset-x-0 top-0 z-[70] h-1 overflow-hidden bg-primary/10">
          <div className="h-full w-1/3 animate-[admin-route-progress_1s_ease-in-out_infinite] rounded-r-full bg-primary shadow-[0_0_18px_var(--primary)]" />
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_52%,#effaf8_100%)] text-slate-800 shadow-2xl shadow-sky-900/10 transition-transform duration-200 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-[72px] items-center justify-between px-5">
          <Link href="/dashboard" onClick={() => handleNavigate("/dashboard")} className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm shadow-blue-200">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight text-slate-950">
                NFC Loyalty
              </span>
              <span className="block truncate text-xs font-medium text-slate-500">
                Command Center
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:bg-sky-100 hover:text-slate-900 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavigate(item.href)}
                className={cn(
                  "flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-blue-500 text-white shadow-[0_14px_24px_-18px_rgba(37,99,235,0.8)]"
                    : "text-slate-600 hover:bg-sky-100 hover:text-slate-950"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sky-100 px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      <div className="mx-auto flex h-full w-full overflow-hidden bg-white shadow-[0_24px_80px_rgba(47,76,105,0.16)] lg:h-[calc(100vh-3rem)] lg:max-w-[calc(100vw-3rem)] lg:rounded-[28px]">
        <aside className="hidden w-60 shrink-0 flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_56%,#effaf8_100%)] text-slate-800 lg:flex">
          <div className="flex h-20 items-center gap-3 px-5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500 text-white shadow-[0_16px_30px_rgba(59,130,246,0.22)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black text-slate-950">NFC Loyalty</p>
              <p className="truncate text-xs font-medium text-slate-500">Merchant Center</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1.5 px-4 py-6" aria-label="Admin navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  onClick={() => handleNavigate(item.href)}
                  className={cn(
                    "group relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-600 transition-all hover:bg-sky-50 hover:text-slate-950",
                    isActive && "bg-blue-500 text-white shadow-[0_16px_26px_-18px_rgba(37,99,235,0.9)] hover:bg-blue-500 hover:text-white"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && <span className="absolute -left-4 h-8 w-1 rounded-r-full bg-cyan-400" />}
                  <span className={cn(
                    "grid h-9 w-9 place-items-center rounded-lg transition",
                    isActive ? "bg-white/15" : "bg-white group-hover:bg-white"
                  )}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <button
            onClick={handleLogout}
            title="Logout"
            className="mx-4 mb-6 flex min-h-[46px] items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white">
              <LogOut className="h-5 w-5" />
            </span>
            Logout
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#fbfdff]">
          <header className="relative z-20 flex min-h-[72px] shrink-0 items-center gap-4 border-b border-slate-200/80 bg-white px-5 shadow-[0_16px_34px_-32px_rgba(15,23,42,0.5)] sm:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="min-w-[120px] text-xl font-black tracking-tight text-slate-900">
              {activeItem?.label ?? "Dashboard"}
            </h1>
            <div className="hidden w-full max-w-[360px] items-center rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-slate-900 shadow-inner shadow-slate-200/30 sm:flex">
              <Search className="mr-3 h-5 w-5 text-sky-500" />
              <input
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search here..."
              />
            </div>
            <div className="relative ml-auto flex items-center gap-1.5 text-slate-500">
              <ApiHealthStatus />
              <Button
                variant="ghost"
                size="icon"
                aria-expanded={openQuickPanel === "messages"}
                onClick={() => setOpenQuickPanel(openQuickPanel === "messages" ? null : "messages")}
                className="hidden rounded-full border border-transparent text-slate-500 hover:border-sky-100 hover:bg-sky-50 hover:text-sky-700 sm:inline-flex"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-expanded={openQuickPanel === "notifications"}
                onClick={() => setOpenQuickPanel(openQuickPanel === "notifications" ? null : "notifications")}
                className="hidden rounded-full border border-transparent text-slate-500 hover:border-amber-100 hover:bg-amber-50 hover:text-amber-700 sm:inline-flex"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-expanded={openQuickPanel === "settings"}
                onClick={() => setOpenQuickPanel(openQuickPanel === "settings" ? null : "settings")}
                className="hidden rounded-full border border-transparent text-slate-500 hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700 sm:inline-flex"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <button
                onClick={() => setOpenQuickPanel(openQuickPanel === "profile" ? null : "profile")}
                aria-expanded={openQuickPanel === "profile"}
                className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 pr-2 shadow-sm shadow-slate-200/60 transition hover:border-sky-200 hover:bg-sky-50"
              >
                <UserCircle className="h-9 w-9 text-slate-500" />
                <ChevronDown className={cn("h-4 w-4 text-slate-900 transition", openQuickPanel === "profile" && "rotate-180")} />
              </button>
              {openQuickPanel && (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)]">
                  {openQuickPanel === "messages" && (
                    <div>
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-black text-slate-950">Messages</p>
                        <p className="text-xs font-medium text-slate-500">3 percakapan perlu dicek</p>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {["Order #128 menunggu konfirmasi", "Member baru meminta bantuan voucher", "Review baru masuk dari pelanggan"].map((item) => (
                          <button key={item} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-sky-50">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-600">
                              <Mail className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{item}</span>
                          </button>
                        ))}
                      </div>
                      <button className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-4 py-3 text-sm font-bold text-sky-700 hover:bg-sky-50">
                        <CheckCheck className="h-4 w-4" />
                        Tandai semua dibaca
                      </button>
                    </div>
                  )}
                  {openQuickPanel === "settings" && (
                    <div>
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-black text-slate-950">Quick Settings</p>
                        <p className="text-xs font-medium text-slate-500">Atur tampilan dan keamanan toko</p>
                      </div>
                      <div className="p-2">
                        {[
                          { label: "Tema tampilan", desc: "Sesuaikan warna merchant center", icon: Palette },
                          { label: "Keamanan akun", desc: "Kelola akses dan sesi login", icon: ShieldCheck },
                          { label: "Pusat bantuan", desc: "Panduan penggunaan platform", icon: LifeBuoy },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link key={item.label} href="/settings" onClick={() => handleNavigate("/settings")} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-emerald-50">
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-bold text-slate-800">{item.label}</span>
                                <span className="block truncate text-xs font-medium text-slate-500">{item.desc}</span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {openQuickPanel === "notifications" && (
                    <div>
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-black text-slate-950">Notifications</p>
                        <p className="text-xs font-medium text-slate-500">Update terbaru dari toko</p>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {["Stok 2 menu sudah habis", "Voucher weekend aktif hari ini", "7 member baru bergabung"].map((item) => (
                          <button key={item} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-amber-50">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
                              <Bell className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{item}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {openQuickPanel === "profile" && (
                    <div>
                      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                        <UserCircle className="h-11 w-11 text-slate-500" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950">NFC Loyalty</p>
                          <p className="truncate text-xs font-medium text-slate-500">Merchant Admin</p>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link href="/settings" onClick={() => handleNavigate("/settings")} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-sky-50">
                          <User className="h-4 w-4 text-sky-600" />
                          Profile akun
                        </Link>
                        <Link href="/settings" onClick={() => handleNavigate("/settings")} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-sky-50">
                          <Store className="h-4 w-4 text-emerald-600" />
                          Data merchant
                        </Link>
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50">
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 pb-8 sm:px-8">
            <div key={pathname} className="admin-page-shell mx-auto w-full max-w-[1380px] min-w-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

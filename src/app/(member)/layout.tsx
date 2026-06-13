"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Home, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/landing", label: "Landing", icon: Store },
  { href: "/home", label: "Home", icon: Home },
  { href: "/order", label: "Order", icon: ShoppingBag },
  { href: "/profile", label: "Profil", icon: User },
];

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Page content — allow scrolling above bottom nav */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom navigation bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        role="navigation"
        aria-label="Menu utama"
      >
        <ul className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive && "stroke-[2.5px]"
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

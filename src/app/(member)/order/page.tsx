"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/member/MenuItemCard";
import { CartDrawer } from "@/components/member/CartDrawer";
import { useCartStore } from "@/stores/cart-store";
import apiClient from "@/lib/api-client";
import type { MenuCategory, MenuItem } from "@/types";

export default function OrderPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addItem = useCartStore((s) => s.addItem);

  // Rehydrate cart store on mount
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  // Fetch menu categories with items
  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        setError(null);
        // Get member profile to extract tenantId for menu endpoint
        const memberRes = await apiClient.get("/api/members/me");
        const tenantId = memberRes.data?.tenantId;
        if (!tenantId) {
          setError("Gagal memuat menu. Tenant tidak ditemukan.");
          return;
        }
        const response = await apiClient.get<MenuCategory[]>(
          "/api/menu/categories",
          { params: { tenantId } }
        );
        const data = Array.isArray(response.data) ? response.data : [];
        setCategories(data);
        if (data.length > 0) {
          setActiveCategory(data[0].id);
        }
      } catch {
        setError("Gagal memuat menu. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
    });
  };

  const activeItems =
    categories.find((c) => c.id === activeCategory)?.items ?? [];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="min-h-[44px]"
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Menu belum tersedia saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-5">
      {/* Page header */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm shadow-slate-900/5">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
          Order
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          Menu
        </h1>
      </div>

      {/* Category tabs */}
      <div className="mt-3 -mx-4 px-4">
        <nav
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          role="tablist"
          aria-label="Kategori menu"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              role="tab"
              aria-selected={activeCategory === category.id}
              aria-controls={`panel-${category.id}`}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px] ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground shadow-sm ring-1 ring-border/80 hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Menu items grid */}
      <div
        id={`panel-${activeCategory}`}
        role="tabpanel"
        aria-label={
          categories.find((c) => c.id === activeCategory)?.name ?? "Menu"
        }
        className="mt-3 flex flex-col gap-3 pb-4"
      >
        {activeItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada item di kategori ini.
          </p>
        ) : (
          activeItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAddToCart={handleAddToCart}
            />
          ))
        )}
      </div>

      {/* Floating cart drawer */}
      <CartDrawer />
    </div>
  );
}

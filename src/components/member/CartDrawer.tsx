"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cart-store";
import { formatIDR } from "@/lib/utils";

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getTotal = useCartStore((s) => s.getTotal);
  const hasUnavailableItems = useCartStore((s) => s.hasUnavailableItems);

  // Rehydrate persisted cart from localStorage
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = getTotal();
  const hasUnavailable = hasUnavailableItems();
  const isEmpty = items.length === 0;
  const checkoutDisabled = isEmpty || hasUnavailable;

  return (
    <Sheet>
      <SheetTrigger
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={`Keranjang belanja, ${itemCount} item`}
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="bottom" className="flex max-h-[85vh] flex-col rounded-t-2xl">
        <SheetHeader className="px-4">
          <SheetTitle>Keranjang ({itemCount})</SheetTitle>
        </SheetHeader>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto px-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingCart className="mb-3 h-12 w-12 opacity-40" />
              <p className="text-sm">Keranjang kosong</p>
              <p className="text-xs">Tambahkan item dari menu</p>
            </div>
          ) : (
            <ul className="divide-y" role="list" aria-label="Item keranjang">
              {items.map((item) => (
                <li
                  key={item.menuItemId}
                  className={`py-3 ${!item.isAvailable ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium leading-tight truncate">
                          {item.name}
                        </span>
                        {!item.isAvailable && (
                          <Badge variant="destructive" className="text-[10px] shrink-0">
                            <AlertTriangle className="mr-0.5 h-3 w-3" />
                            Tidak tersedia
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatIDR(item.price)} × {item.quantity}
                      </p>
                      {item.isAvailable && (
                        <p className="text-xs font-semibold text-foreground">
                          {formatIDR(item.price * item.quantity)}
                        </p>
                      )}
                      {!item.isAvailable && (
                        <p className="text-xs text-destructive font-medium">
                          Tidak dihitung dalam total
                        </p>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="h-9 w-9 min-h-[36px] min-w-[36px]"
                        onClick={() =>
                          updateQuantity(item.menuItemId, item.quantity - 1)
                        }
                        aria-label={`Kurangi ${item.name}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>

                      <span className="w-7 text-center text-sm font-medium tabular-nums">
                        {item.quantity}
                      </span>

                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="h-9 w-9 min-h-[36px] min-w-[36px]"
                        disabled={item.quantity >= 99}
                        onClick={() =>
                          updateQuantity(item.menuItemId, item.quantity + 1)
                        }
                        aria-label={`Tambah ${item.name}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-9 w-9 min-h-[36px] min-w-[36px] text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.menuItemId)}
                        aria-label={`Hapus ${item.name} dari keranjang`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer with total and checkout */}
        <SheetFooter className="border-t px-4 py-3 space-y-2">
          {hasUnavailable && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                Hapus item yang tidak tersedia sebelum checkout
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Total
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatIDR(total)}
            </span>
          </div>

          {checkoutDisabled ? (
            <Button
              size="lg"
              className="w-full min-h-[48px] text-base"
              disabled
            >
              Checkout
            </Button>
          ) : (
            <Link href="/checkout" className="block">
              <Button
                size="lg"
                className="w-full min-h-[48px] text-base"
              >
                Checkout — {formatIDR(total)}
              </Button>
            </Link>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

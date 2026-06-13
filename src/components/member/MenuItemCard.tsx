"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils";
import type { MenuItem } from "@/types";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const truncatedDescription =
    item.description && item.description.length > 200
      ? item.description.slice(0, 200) + "…"
      : item.description;

  return (
    <div
      className={`flex gap-3 rounded-xl border p-3 transition-colors ${
        item.isAvailable
          ? "bg-card"
          : "bg-muted/50 opacity-60"
      }`}
    >
      {/* Item image or placeholder */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ShoppingBagIcon className="h-8 w-8" />
          </div>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
            <span className="text-[10px] font-semibold text-white uppercase">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Item info */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <h3 className="text-sm font-semibold leading-tight text-foreground line-clamp-1">
            {item.name}
          </h3>
          {truncatedDescription && (
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground line-clamp-2">
              {truncatedDescription}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-primary">
            {formatIDR(item.price)}
          </span>
          <Button
            size="sm"
            variant="default"
            className="min-h-[44px] min-w-[44px] gap-1"
            disabled={!item.isAvailable}
            onClick={() => onAddToCart(item)}
            aria-label={`Tambah ${item.name} ke keranjang`}
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs">Tambah</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

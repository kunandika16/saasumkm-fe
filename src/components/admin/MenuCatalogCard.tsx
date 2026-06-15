"use client";

import { ChefHat, ImageIcon, Pencil, Trash2 } from "lucide-react";

import { API_BASE_URL } from "@/lib/constants";
import { cn, formatIDR } from "@/lib/utils";
import type { MenuItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MenuCatalogCardProps {
  item: MenuItem;
  categoryName: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}

export function MenuCatalogCard({
  item,
  categoryName,
  onEdit,
  onDelete,
  onToggleAvailability,
}: MenuCatalogCardProps) {
  const imageUrl = item.imageUrl
    ? item.imageUrl.startsWith("http")
      ? item.imageUrl
      : `${API_BASE_URL}${item.imageUrl}`
    : null;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_16px_38px_-34px_rgba(15,23,42,0.85)] transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_24px_46px_-36px_rgba(15,23,42,0.8)]">
      <div className="relative h-40 bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-[linear-gradient(135deg,#f0f9ff_0%,#e5f7ff_50%,#ecfff7_100%)]">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-sky-500 shadow-[0_12px_28px_-22px_rgba(14,165,233,0.9)] ring-1 ring-white">
              <ImageIcon className="h-5 w-5" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              No Image
            </span>
          </div>
        )}
        <Badge
          variant={item.isAvailable ? "default" : "secondary"}
          className={cn(
            "absolute right-3 top-3 rounded-full px-3 py-1 text-xs text-white shadow-[0_12px_24px_-18px_rgba(15,23,42,0.7)]",
            item.isAvailable ? "bg-emerald-600" : "bg-amber-500"
          )}
        >
          {item.isAvailable ? "Tersedia" : "Habis"}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[17px] font-black text-slate-950">
              {item.name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <ChefHat className="h-3.5 w-3.5 text-sky-500" />
              {categoryName}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
            {formatIDR(item.price)}
          </span>
        </div>

        <p className="mt-3 min-h-[40px] line-clamp-2 text-sm leading-5 text-slate-500">
          {item.description || "Belum ada deskripsi menu."}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-5">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAvailability}
            className="h-10 rounded-xl border-slate-200 bg-white px-4 text-xs font-black text-slate-700 shadow-sm shadow-slate-200/70 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            {item.isAvailable ? "Tandai Habis" : "Tandai Tersedia"}
          </Button>
          <div className="ml-auto flex gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onEdit}
              aria-label={`Edit ${item.name}`}
              className="rounded-xl text-slate-700 hover:bg-sky-50 hover:text-sky-600"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              aria-label={`Hapus ${item.name}`}
              className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

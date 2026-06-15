"use client";

import { FolderPlus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface MenuCatalogEmptyStateProps {
  type: "categories" | "items";
  categoryName?: string;
  onCreateCategory?: () => void;
  onCreateMenu?: () => void;
}

export function MenuCatalogEmptyState({
  type,
  categoryName,
  onCreateCategory,
  onCreateMenu,
}: MenuCatalogEmptyStateProps) {
  const isCategoryEmpty = type === "categories";

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center shadow-sm">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-sky-500">
        {isCategoryEmpty ? <FolderPlus className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-950">
        {isCategoryEmpty ? "Belum ada kategori" : "Belum ada item menu"}
      </h2>
      <p className="mt-1 max-w-sm text-sm font-medium text-slate-500">
        {isCategoryEmpty
          ? "Buat kategori terlebih dahulu sebelum menambahkan menu."
          : `Tambahkan menu${categoryName ? ` untuk kategori ${categoryName}` : ""}.`}
      </p>
      <Button
        className="mt-5"
        onClick={isCategoryEmpty ? onCreateCategory : onCreateMenu}
      >
        {isCategoryEmpty ? (
          <FolderPlus className="mr-2 h-4 w-4" />
        ) : (
          <Plus className="mr-2 h-4 w-4" />
        )}
        {isCategoryEmpty ? "Buat Kategori" : "Tambah Menu"}
      </Button>
    </div>
  );
}

"use client";

import { FolderPlus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface MenuCatalogActionsProps {
  onCreateCategory: () => void;
  onCreateMenu: () => void;
}

export function MenuCatalogActions({
  onCreateCategory,
  onCreateMenu,
}: MenuCatalogActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onCreateCategory} className="h-10 rounded-xl border-slate-200 bg-white px-4 text-slate-700 shadow-sm shadow-slate-200/70 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">
          <FolderPlus className="mr-2 h-4 w-4" />
          Kategori Baru
        </Button>
        <Button size="sm" onClick={onCreateMenu} className="h-10 rounded-xl bg-blue-500 px-4 text-white shadow-[0_16px_28px_-18px_rgba(37,99,235,0.9)] hover:bg-blue-600">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Menu
        </Button>
      </div>
    </div>
  );
}

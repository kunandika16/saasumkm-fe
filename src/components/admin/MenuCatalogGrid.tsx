"use client";

import type { MenuItem } from "@/types";
import { MenuCatalogCard } from "@/components/admin/MenuCatalogCard";
import { MenuCatalogEmptyState } from "@/components/admin/MenuCatalogEmptyState";

interface MenuCatalogGridProps {
  items: MenuItem[];
  categoryName: (categoryId: string) => string;
  activeCategoryName?: string;
  onCreateMenu: () => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggleAvailability: (item: MenuItem) => void;
}

export function MenuCatalogGrid({
  items,
  categoryName,
  activeCategoryName,
  onCreateMenu,
  onEdit,
  onDelete,
  onToggleAvailability,
}: MenuCatalogGridProps) {
  if (items.length === 0) {
    return (
      <MenuCatalogEmptyState
        type="items"
        categoryName={activeCategoryName}
        onCreateMenu={onCreateMenu}
      />
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((item) => (
        <MenuCatalogCard
          key={item.id}
          item={item}
          categoryName={categoryName(item.categoryId)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
          onToggleAvailability={() => onToggleAvailability(item)}
        />
      ))}
    </div>
  );
}

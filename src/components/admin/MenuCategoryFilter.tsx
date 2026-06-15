"use client";

import type { MenuCategory } from "@/types";
import { cn } from "@/lib/utils";

interface MenuCategoryFilterProps {
  categories: MenuCategory[];
  allCount: number;
  activeValue: string;
  onChange: (value: string) => void;
}

export function MenuCategoryFilter({
  categories,
  allCount,
  activeValue,
  onChange,
}: MenuCategoryFilterProps) {
  return (
    <div className="min-w-0 flex-1 overflow-x-auto">
      <div className="flex min-w-max gap-1.5">
        <CategoryButton
          active={activeValue === "all"}
          label="Semua"
          count={allCount}
          onClick={() => onChange("all")}
        />
        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            active={activeValue === category.id}
            label={category.name}
            count={category.items?.length ?? 0}
            onClick={() => onChange(category.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 rounded-xl px-4 text-sm font-black text-slate-500 transition-all duration-200",
        "hover:bg-sky-50 hover:text-slate-950",
        active &&
          "bg-blue-500 text-white shadow-[0_14px_26px_-18px_rgba(37,99,235,0.95)] hover:bg-blue-500 hover:text-white"
      )}
    >
      {label} <span className={cn("font-bold", active ? "text-white/80" : "text-slate-400")}>({count})</span>
    </button>
  );
}

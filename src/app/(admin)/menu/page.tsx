"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  FolderPlus,
} from "lucide-react";

import apiClient from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/constants";
import { formatIDR } from "@/lib/utils";
import type { MenuCategory, MenuItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import MenuItemForm, {
  type MenuItemFormData,
} from "@/components/admin/MenuItemForm";

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Sheet state for create/edit form
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: MenuItem | null;
  }>({ open: false, item: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Fetch Categories with Items ─────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      // Get tenantId from settings endpoint, then fetch public categories
      const settingsRes = await apiClient.get("/api/admin/settings");
      const tenantId = settingsRes.data?.tenantId;

      if (!tenantId) {
        setCategories([]);
        return;
      }

      const { data } = await apiClient.get("/api/menu/categories", {
        params: { tenantId },
      });
      setCategories(Array.isArray(data) ? data : (data?.categories ?? []));
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ─── Get all items (flat list) ──────────────────────────────────────────

  const allItems: MenuItem[] = categories.flatMap((cat) => cat.items ?? []);

  const filteredItems =
    activeTab === "all"
      ? allItems
      : categories.find((c) => c.id === activeTab)?.items ?? [];

  // ─── Create / Edit Item ─────────────────────────────────────────────────

  function handleCreateNew() {
    setEditingItem(null);
    setSheetOpen(true);
  }

  function handleEdit(item: MenuItem) {
    setEditingItem(item);
    setSheetOpen(true);
  }

  async function handleFormSubmit(formData: MenuItemFormData) {
    if (editingItem) {
      // Update existing item
      await apiClient.patch(`/api/admin/menu/items/${editingItem.id}`, formData);
    } else {
      // Create new item
      await apiClient.post("/api/admin/menu/items", formData);
    }
    setSheetOpen(false);
    setEditingItem(null);
    fetchCategories();
  }

  // ─── Toggle Availability ────────────────────────────────────────────────

  async function handleToggleAvailability(item: MenuItem) {
    try {
      await apiClient.patch(`/api/admin/menu/items/${item.id}`, {
        isAvailable: !item.isAvailable,
      });
      fetchCategories();
    } catch {
      // silently fail — user can retry
    }
  }

  // ─── Delete Item ────────────────────────────────────────────────────────

  function handleDeleteClick(item: MenuItem) {
    setDeleteDialog({ open: true, item });
  }

  async function executeDelete() {
    if (!deleteDialog.item) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/api/admin/menu/items/${deleteDialog.item.id}`);
      setDeleteDialog({ open: false, item: null });
      fetchCategories();
    } catch {
      // leave dialog open on failure
    } finally {
      setDeleteLoading(false);
    }
  }

  // ─── Create Category ────────────────────────────────────────────────────

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setCategoryError("Nama kategori tidak boleh kosong");
      return;
    }
    setCategoryLoading(true);
    setCategoryError(null);
    try {
      await apiClient.post("/api/admin/menu/categories", {
        name: newCategoryName.trim(),
        sortOrder: categories.length,
      });
      setNewCategoryName("");
      setCategoryDialogOpen(false);
      fetchCategories();
    } catch {
      setCategoryError("Gagal membuat kategori. Coba lagi.");
    } finally {
      setCategoryLoading(false);
    }
  }

  // ─── Helper: get category name ──────────────────────────────────────────

  function getCategoryName(categoryId: string): string {
    return categories.find((c) => c.id === categoryId)?.name ?? "-";
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Menu</h1>
          <p className="text-sm text-muted-foreground">
            Kelola kategori dan item menu restoran Anda.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCategoryError(null);
              setNewCategoryName("");
              setCategoryDialogOpen(true);
            }}
          >
            <FolderPlus className="h-4 w-4 mr-1" />
            Kategori Baru
          </Button>
          <Button size="sm" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-1" />
            Tambah Menu
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">
            Belum ada kategori. Buat kategori terlebih dahulu untuk menambahkan
            menu.
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setCategoryError(null);
              setNewCategoryName("");
              setCategoryDialogOpen(true);
            }}
          >
            <FolderPlus className="h-4 w-4 mr-1" />
            Buat Kategori Pertama
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              Semua ({allItems.length})
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.name} ({cat.items?.length ?? 0})
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab content — shared item list */}
          <TabsContent value={activeTab} className="mt-4">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Belum ada item menu
                  {activeTab !== "all" &&
                    ` di kategori "${getCategoryName(activeTab)}"`}
                  .
                </p>
                <Button
                  variant="outline"
                  className="mt-3"
                  size="sm"
                  onClick={handleCreateNew}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Menu
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    categoryName={getCategoryName(item.categoryId)}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDeleteClick(item)}
                    onToggleAvailability={() =>
                      handleToggleAvailability(item)
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Create/Edit Item Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editingItem ? "Edit Menu Item" : "Tambah Menu Item"}
            </SheetTitle>
            <SheetDescription>
              {editingItem
                ? "Ubah detail menu item."
                : "Isi detail untuk menu item baru."}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <MenuItemForm
              categories={categories}
              initialData={editingItem}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setSheetOpen(false);
                setEditingItem(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Category Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryDialogOpen(false);
            setCategoryError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Kategori Baru</DialogTitle>
            <DialogDescription>
              Tambahkan kategori untuk mengorganisir menu Anda.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="category-name"
                className="text-sm font-medium"
              >
                Nama Kategori
              </label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Contoh: Makanan Utama"
                maxLength={50}
                autoFocus
              />
              {categoryError && (
                <p className="text-xs text-red-500">{categoryError}</p>
              )}
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Batal
              </DialogClose>
              <Button type="submit" disabled={categoryLoading}>
                {categoryLoading && (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                )}
                Buat Kategori
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) setDeleteDialog({ open: false, item: null });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Menu Item</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus &quot;{deleteDialog.item?.name}
              &quot;? Aksi ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Batal
            </DialogClose>
            <Button
              onClick={executeDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading && (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Menu Item Card Component ────────────────────────────────────────────────

interface MenuItemCardProps {
  item: MenuItem;
  categoryName: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}

function MenuItemCard({
  item,
  categoryName,
  onEdit,
  onDelete,
  onToggleAvailability,
}: MenuItemCardProps) {
  const imageUrl = item.imageUrl
    ? item.imageUrl.startsWith("http")
      ? item.imageUrl
      : `${API_BASE_URL}${item.imageUrl}`
    : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition hover:shadow-md">
      {/* Image */}
      <div className="relative h-36 w-full bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs text-muted-foreground">No Image</span>
          </div>
        )}
        {/* Availability badge */}
        <Badge
          variant={item.isAvailable ? "default" : "secondary"}
          className="absolute top-2 right-2 text-xs"
        >
          {item.isAvailable ? "Tersedia" : "Habis"}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium">{item.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {categoryName}
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-primary">
            {formatIDR(item.price)}
          </span>
        </div>

        {item.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
            {item.description}
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto flex items-center gap-1 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAvailability}
            className="text-xs"
          >
            {item.isAvailable ? "Tandai Habis" : "Tandai Tersedia"}
          </Button>
          <div className="ml-auto flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onEdit}
              aria-label={`Edit ${item.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              aria-label={`Hapus ${item.name}`}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

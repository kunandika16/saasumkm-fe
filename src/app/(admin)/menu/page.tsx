"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import apiClient from "@/lib/api-client";
import type { MenuCategory, MenuItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuCatalogSkeleton } from "@/components/ui/loading-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import MenuItemForm, {
  type MenuItemFormData,
} from "@/components/admin/MenuItemForm";
import { MenuCatalogActions } from "@/components/admin/MenuCatalogActions";
import { MenuCategoryFilter } from "@/components/admin/MenuCategoryFilter";
import { MenuCatalogEmptyState } from "@/components/admin/MenuCatalogEmptyState";
import { MenuCatalogGrid } from "@/components/admin/MenuCatalogGrid";

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Dialog state for create/edit form
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
    // Build multipart FormData for the backend
    const body = new FormData();
    body.append("name", formData.name);
    body.append("description", formData.description);
    body.append("price", formData.price.toString());
    body.append("categoryId", formData.categoryId);
    body.append("isAvailable", formData.isAvailable.toString());

    if (formData.imageFile) {
      body.append("image", formData.imageFile);
    } else if (formData.imageUrl === null && editingItem?.imageUrl) {
      // Explicitly remove existing image
      body.append("imageUrl", "null");
    }

    try {
      let res;
      if (editingItem) {
        res = await apiClient.patch(`/api/admin/menu/items/${editingItem.id}`, body);
      } else {
        res = await apiClient.post("/api/admin/menu/items", body);
      }

      // The auto-unwrap interceptor replaces response.data with the inner 'data' field.
      // Warning lives at the top level of the original response, so check raw response.
      const rawData = res?.data;
      const warning = rawData?.warning;
      if (warning) {
        alert(warning);
      }

      setSheetOpen(false);
      setEditingItem(null);
      fetchCategories();
    } catch (err: unknown) {
      // Extract error message from backend response
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = axiosErr?.response?.data?.error?.message || "Gagal menyimpan menu. Silakan coba lagi.";
      alert(msg);
    }
  }

  // ─── Toggle Availability ────────────────────────────────────────────────

  async function handleToggleAvailability(item: MenuItem) {
    try {
      const body = new FormData();
      body.append("isAvailable", (!item.isAvailable).toString());
      await apiClient.patch(`/api/admin/menu/items/${item.id}`, body);
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

  const activeCategoryName =
    activeTab === "all" ? undefined : getCategoryName(activeTab);

  function openCategoryDialog() {
    setCategoryError(null);
    setNewCategoryName("");
    setCategoryDialogOpen(true);
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-w-0 space-y-4 py-5">
      {/* Content */}
      {loading ? (
        <MenuCatalogSkeleton />
      ) : categories.length === 0 ? (
        <MenuCatalogEmptyState
          type="categories"
          onCreateCategory={openCategoryDialog}
        />
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.75)]">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <MenuCategoryFilter
                categories={categories}
                allCount={allItems.length}
                activeValue={activeTab}
                onChange={setActiveTab}
              />
              <MenuCatalogActions
                onCreateCategory={openCategoryDialog}
                onCreateMenu={handleCreateNew}
              />
            </div>
          </div>
          <MenuCatalogGrid
            items={filteredItems}
            categoryName={getCategoryName}
            activeCategoryName={activeCategoryName}
            onCreateMenu={handleCreateNew}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onToggleAvailability={handleToggleAvailability}
          />
        </>
      )}

      {/* Create/Edit Item Dialog */}
      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f0f9ff_58%,#ecfeff_100%)] px-7 py-6">
            <DialogTitle>
              {editingItem ? "Edit Menu Item" : "Tambah Menu Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Ubah detail menu item."
                : "Isi detail untuk menu item baru."}
            </DialogDescription>
          </DialogHeader>
          <div className="px-7 py-6">
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
        </DialogContent>
      </Dialog>

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
        <DialogContent className="p-0 sm:max-w-md">
          <DialogHeader className="border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f0f9ff_70%,#ecfeff_100%)] px-6 py-5">
            <DialogTitle>Buat Kategori Baru</DialogTitle>
            <DialogDescription>
              Tambahkan kategori untuk mengorganisir menu Anda.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-5 px-6 py-5">
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
            <DialogFooter className="-mx-6 -mb-5">
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
        <DialogContent className="p-0 sm:max-w-md">
          <DialogHeader className="border-b border-red-100 bg-red-50/70 px-6 py-5">
            <DialogTitle>Hapus Menu Item</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus &quot;{deleteDialog.item?.name}
              &quot;? Aksi ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-6">
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

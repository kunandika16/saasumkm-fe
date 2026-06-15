"use client";

import { useCallback, useEffect, useState } from "react";
import { Gift, Plus, Pencil } from "lucide-react";

import apiClient from "@/lib/api-client";
import type { Reward } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RewardForm, {
  type RewardFormData,
} from "@/components/admin/RewardForm";
import { AdminCardGridSkeleton } from "@/components/ui/loading-state";

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state for create/edit
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ rewards: Reward[] }>(
        "/api/admin/rewards"
      );
      setRewards(data?.rewards ?? []);
    } catch {
      setRewards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  function handleCreate() {
    setEditingReward(null);
    setSheetOpen(true);
  }

  function handleEdit(reward: Reward) {
    setEditingReward(reward);
    setSheetOpen(true);
  }

  async function handleToggleActive(reward: Reward) {
    try {
      await apiClient.patch(`/api/admin/rewards/${reward.id}`, {
        isActive: !reward.isActive,
      });
      // Update local state optimistically
      setRewards((prev) =>
        prev.map((r) =>
          r.id === reward.id ? { ...r, isActive: !r.isActive } : r
        )
      );
    } catch {
      // Revert — refetch
      fetchRewards();
    }
  }

  async function handleSubmit(data: RewardFormData) {
    if (editingReward) {
      // Update existing reward
      await apiClient.patch(`/api/admin/rewards/${editingReward.id}`, data);
    } else {
      // Create new reward
      await apiClient.post("/api/admin/rewards", data);
    }
    setSheetOpen(false);
    setEditingReward(null);
    fetchRewards();
  }

  function handleCancel() {
    setSheetOpen(false);
    setEditingReward(null);
  }

  return (
    <div className="min-w-0 space-y-4 py-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.75)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900">Katalog reward</p>
            <p className="text-xs font-medium text-slate-500">
              {rewards.length} reward tersedia
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="h-10 rounded-xl bg-blue-500 px-4 text-white shadow-[0_16px_28px_-18px_rgba(37,99,235,0.9)] hover:bg-blue-600"
          >
            <Plus className="mr-1 h-4 w-4" />
            Tambah Reward
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <AdminCardGridSkeleton cards={6} />
      ) : rewards.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Gift className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">Belum ada reward</p>
          <p className="text-sm text-muted-foreground">
            Buat reward pertama untuk member Anda.
          </p>
          <Button className="mt-4" onClick={handleCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Tambah Reward
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <Card key={reward.id} className="flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold">{reward.name}</h3>
                  {reward.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {reward.description}
                    </p>
                  )}
                </div>
                <Badge variant={reward.isActive ? "default" : "secondary"}>
                  {reward.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>

              {/* Details */}
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {reward.requiredPoints} poin
                </span>
                <span>Stok: {reward.stockQuantity}</span>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2 border-t pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(reward)}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant={reward.isActive ? "secondary" : "default"}
                  size="sm"
                  onClick={() => handleToggleActive(reward)}
                >
                  {reward.isActive ? "Nonaktifkan" : "Aktifkan"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
      >
        <DialogContent className="max-h-[88vh] overflow-y-auto p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fff7ed_50%,#f0f9ff_100%)] px-7 py-6">
            <DialogTitle>
              {editingReward ? "Edit Reward" : "Tambah Reward"}
            </DialogTitle>
            <DialogDescription>
              {editingReward
                ? "Ubah detail reward yang sudah ada."
                : "Buat reward baru yang bisa ditukar member dengan poin."}
            </DialogDescription>
          </DialogHeader>
          <div className="px-7 py-6">
            <RewardForm
              key={editingReward?.id ?? "create"}
              reward={editingReward}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

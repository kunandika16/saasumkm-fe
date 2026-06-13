"use client";

import { useCallback, useEffect, useState } from "react";
import { Gift, Loader2, Plus, Pencil } from "lucide-react";

import apiClient from "@/lib/api-client";
import type { Reward } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import RewardForm, {
  type RewardFormData,
} from "@/components/admin/RewardForm";

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  // Sheet state for create/edit
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
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Rewards</h1>
          <p className="text-sm text-muted-foreground">
            Kelola hadiah yang bisa ditukar member dengan poin.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Tambah Reward
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
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
            <Card key={reward.id} className="flex flex-col p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium">{reward.name}</h3>
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

      {/* Create/Edit Sheet */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
      >
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>
              {editingReward ? "Edit Reward" : "Tambah Reward"}
            </SheetTitle>
            <SheetDescription>
              {editingReward
                ? "Ubah detail reward yang sudah ada."
                : "Buat reward baru yang bisa ditukar member dengan poin."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <RewardForm
              key={editingReward?.id ?? "create"}
              reward={editingReward}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

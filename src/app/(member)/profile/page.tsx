"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  RefreshCw,
  Loader2,
  Check,
  Pencil,
  Gift,
} from "lucide-react";
import { AxiosError } from "axios";

import apiClient from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import {
  ProfileUpdateSchema,
  type ProfileUpdateInput,
} from "@/lib/validators/member";
import type { Member, Reward, ApiError } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OrderHistoryList } from "@/components/member/OrderHistoryList";
import { PointHistory } from "@/components/member/PointHistory";
import { RewardCard } from "@/components/member/RewardCard";

export default function ProfilePage() {
  const [member, setMember] = useState<Member | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Name edit state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(ProfileUpdateSchema),
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [memberRes, rewardsRes] = await Promise.all([
        apiClient.get<Member>("/api/members/me"),
        apiClient.get<{ rewards: Reward[] }>("/api/rewards"),
      ]);
      setMember(memberRes.data);
      const rewardsData = rewardsRes.data;
      setRewards(
        Array.isArray(rewardsData)
          ? rewardsData
          : (rewardsData?.rewards ?? [])
      );
      reset({ name: memberRes.data?.name ?? "" });
    } catch {
      setError("Gagal memuat data profil. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmitName = async (data: ProfileUpdateInput) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await apiClient.patch<Member>("/api/members/me", {
        name: data.name,
      });
      setMember(response.data);
      reset({ name: response.data.name });
      setSaveSuccess(true);
      setIsEditing(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message ||
        "Gagal menyimpan nama. Silakan coba lagi.";
      setSaveError(message);
      // Retain previous name in form
      if (member) {
        reset({ name: member.name });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
    if (member) {
      reset({ name: member.name });
    }
  };

  const handleRewardRedeemed = () => {
    // Refresh member data and rewards after redemption
    fetchData();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex max-w-xs flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Terjadi Kesalahan
            </p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button
            onClick={fetchData}
            variant="outline"
            size="lg"
            className="min-h-[44px] min-w-[44px] gap-2"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="mx-auto w-full max-w-md px-4 pt-6">
      {/* Page title */}
      <h1 className="text-xl font-semibold text-foreground mb-6">Profil</h1>

      {/* Member Info Section */}
      <section className="rounded-xl border bg-card p-4 space-y-4 mb-6">
        {/* Name with edit */}
        <div className="space-y-2">
          {isEditing ? (
            <form
              onSubmit={handleSubmit(onSubmitName)}
              className="space-y-2"
            >
              <label
                htmlFor="name-input"
                className="text-xs text-muted-foreground"
              >
                Nama
              </label>
              <div className="flex gap-2">
                <Input
                  id="name-input"
                  {...register("name")}
                  className="min-h-[44px] flex-1"
                  aria-invalid={!!formErrors.name}
                  aria-describedby={
                    formErrors.name ? "name-error" : undefined
                  }
                />
                <Button
                  type="submit"
                  size="lg"
                  className="min-h-[44px] min-w-[44px]"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="min-h-[44px] min-w-[44px]"
                  onClick={handleCancelEdit}
                >
                  Batal
                </Button>
              </div>
              {formErrors.name && (
                <p
                  id="name-error"
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {formErrors.name.message}
                </p>
              )}
              {saveError && (
                <p className="text-xs text-destructive" role="alert">
                  {saveError}
                </p>
              )}
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Nama</p>
                <p className="text-sm font-medium text-foreground">
                  {member.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px]"
                onClick={() => setIsEditing(true)}
                aria-label="Edit nama"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
          {saveSuccess && (
            <p className="text-xs text-primary">Nama berhasil diperbarui!</p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <p className="text-xs text-muted-foreground">WhatsApp</p>
          <p className="text-sm font-medium text-foreground">
            {member.whatsapp}
          </p>
        </div>

        {/* Member ID */}
        <div>
          <p className="text-xs text-muted-foreground">ID Member</p>
          <p className="text-sm font-mono text-foreground">
            {member.id}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div className="text-center">
            <p className="text-lg font-semibold text-primary tabular-nums">
              {(member.pointBalance ?? 0).toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-muted-foreground">Poin</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold tabular-nums">
              {member.totalVisits}
            </p>
            <p className="text-xs text-muted-foreground">Kunjungan</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {member.registeredAt ? formatDate(member.registeredAt) : "-"}
            </p>
            <p className="text-xs text-muted-foreground">Bergabung</p>
          </div>
        </div>
      </section>

      {/* Tabbed content */}
      <Tabs defaultValue="orders">
        <TabsList className="w-full">
          <TabsTrigger value="orders" className="min-h-[44px] flex-1">
            Pesanan
          </TabsTrigger>
          <TabsTrigger value="points" className="min-h-[44px] flex-1">
            Poin
          </TabsTrigger>
          <TabsTrigger value="rewards" className="min-h-[44px] flex-1">
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="pt-4">
          <OrderHistoryList />
        </TabsContent>

        <TabsContent value="points" className="pt-4">
          <PointHistory />
        </TabsContent>

        <TabsContent value="rewards" className="pt-4">
          {rewards.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Gift className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Belum ada reward yang tersedia.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  onRedeemed={handleRewardRedeemed}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

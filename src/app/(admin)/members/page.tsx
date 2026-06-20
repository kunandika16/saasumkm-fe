"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Search,
  Send,
  Users,
} from "lucide-react";

import apiClient from "@/lib/api-client";
import type { Member } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AdminTableSkeleton } from "@/components/ui/loading-state";
import { WhatsAppConnectionStatus } from "@/components/admin/WhatsAppConnectionStatus";
import QRCodeModal from "@/components/admin/QRCodeModal";
import BlastModal from "@/components/admin/BlastModal";

const PAGE_SIZE = 20;

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // WhatsApp state
  const [isConnected, setIsConnected] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showBlastModal, setShowBlastModal] = useState(false);
  const [singleMember, setSingleMember] = useState<
    { id: string; name: string; whatsapp: string } | undefined
  >(undefined);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{
        members: Member[];
        pagination: {
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
        };
      }>("/api/admin/members", {
        params: { page, pageSize: PAGE_SIZE },
      });
      setMembers(data?.members ?? []);
      setTotalPages(data?.pagination?.totalPages ?? 1);
      setTotal(data?.pagination?.totalItems ?? 0);
    } catch {
      setMembers([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Client-side search filter
  const filteredMembers = members.filter((member) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.whatsapp.includes(query)
    );
  });

  return (
    <div className="min-w-0 space-y-4 py-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.75)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900">Data member</p>
            <p className="text-xs font-medium text-slate-500">
              {total} member terdaftar
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <WhatsAppConnectionStatus
              onConnect={() => setShowQRModal(true)}
              onStatusChange={setIsConnected}
            />
            <div
              title={
                !isConnected
                  ? "Hubungkan WhatsApp terlebih dahulu"
                  : undefined
              }
            >
              <Button
                variant="default"
                size="sm"
                disabled={!isConnected}
                onClick={() => setShowBlastModal(true)}
                className="gap-1.5"
              >
                <Send className="h-4 w-4" />
                Blast WhatsApp
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
            <Input
              placeholder="Cari nama atau nomor WhatsApp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl border-slate-200 bg-slate-50/80 pl-9"
              aria-label="Cari member"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <AdminTableSkeleton rows={7} columns={6} />
      ) : filteredMembers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">
            {search.trim()
              ? "Tidak ada member yang cocok"
              : "Belum ada member"}
          </p>
          <p className="text-sm text-muted-foreground">
            {search.trim()
              ? "Coba kata kunci lain."
              : "Member akan muncul setelah melakukan registrasi."}
          </p>
        </Card>
      ) : (
        <>
          {/* Table - desktop */}
          <div className="hidden overflow-x-auto rounded-xl border border-border/80 bg-card shadow-sm shadow-slate-900/5 md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/60">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    WhatsApp
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Kunjungan
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Poin
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Terdaftar
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Kunjungan Terakhir
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b last:border-b-0 hover:bg-muted/45"
                  >
                    <td className="px-4 py-3 font-medium">{member.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {member.whatsapp}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {member.totalVisits}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="secondary">{member.pointBalance}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(member.registeredAt), "dd MMM yyyy", {
                        locale: id,
                      })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {member.lastVisitAt
                        ? format(
                            new Date(member.lastVisitAt),
                            "dd MMM yyyy",
                            { locale: id }
                          )
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {member.whatsapp && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!isConnected}
                          title={
                            !isConnected
                              ? "Hubungkan WhatsApp terlebih dahulu"
                              : `Kirim pesan ke ${member.name}`
                          }
                          onClick={() => {
                            setSingleMember({
                              id: member.id,
                              name: member.name,
                              whatsapp: member.whatsapp,
                            });
                            setShowBlastModal(true);
                          }}
                          className="h-8 w-8 p-0"
                          aria-label={`Send WhatsApp to ${member.name}`}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards - mobile */}
          <div className="space-y-3 md:hidden">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.whatsapp}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.whatsapp && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!isConnected}
                        title={
                          !isConnected
                            ? "Hubungkan WhatsApp terlebih dahulu"
                            : `Kirim pesan ke ${member.name}`
                        }
                        onClick={() => {
                          setSingleMember({
                            id: member.id,
                            name: member.name,
                            whatsapp: member.whatsapp,
                          });
                          setShowBlastModal(true);
                        }}
                        className="h-8 w-8 p-0"
                        aria-label={`Send WhatsApp to ${member.name}`}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Badge variant="secondary">
                      {member.pointBalance} poin
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{member.totalVisits} kunjungan</span>
                  <span>•</span>
                  <span>
                    Sejak{" "}
                    {format(new Date(member.registeredAt), "dd MMM yyyy", {
                      locale: id,
                    })}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages} ({total} member)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* WhatsApp Modals */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        onConnected={() => {
          setShowQRModal(false);
          setIsConnected(true);
        }}
      />
      <BlastModal
        isOpen={showBlastModal}
        onClose={() => {
          setShowBlastModal(false);
          setSingleMember(undefined);
        }}
        singleMember={singleMember}
      />
    </div>
  );
}

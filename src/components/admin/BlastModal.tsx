"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getTemplates,
  sendSingle,
} from "@/lib/whatsapp-api";

import BlastCategorySelector from "./BlastCategorySelector";
import BlastTemplateEditor from "./BlastTemplateEditor";
import BlastConfirmation from "./BlastConfirmation";
import BlastProgressBar from "./BlastProgressBar";

// ─── Types ───────────────────────────────────────────────────────────────────

type BlastStep = "category" | "editor" | "confirmation" | "progress";

interface BlastModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleMember?: { id: string; name: string; whatsapp: string };
}

interface BlastState {
  category: string;
  inactivityPeriod?: string;
  message: string;
  template: string;
  recipientCount: number;
  sampleRecipientName: string;
  jobId: string;
}

// ─── Initial State ───────────────────────────────────────────────────────────

const INITIAL_STATE: BlastState = {
  category: "",
  inactivityPeriod: undefined,
  message: "",
  template: "",
  recipientCount: 0,
  sampleRecipientName: "",
  jobId: "",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function BlastModal({
  isOpen,
  onClose,
  singleMember,
}: BlastModalProps) {
  const [step, setStep] = useState<BlastStep>(
    singleMember ? "editor" : "category"
  );
  const [state, setState] = useState<BlastState>(() => {
    if (singleMember) {
      return {
        ...INITIAL_STATE,
        category: "custom",
        recipientCount: 1,
        sampleRecipientName: singleMember.name || "Pelanggan",
      };
    }
    return INITIAL_STATE;
  });
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Reset all state when modal closes ───────────────────────────────────

  const handleClose = useCallback(() => {
    setStep(singleMember ? "editor" : "category");
    setState(
      singleMember
        ? {
            ...INITIAL_STATE,
            category: "custom",
            recipientCount: 1,
            sampleRecipientName: singleMember.name || "Pelanggan",
          }
        : INITIAL_STATE
    );
    setLoadingTemplate(false);
    setError(null);
    onClose();
  }, [onClose, singleMember]);

  // ─── Category Selection → Editor transition ──────────────────────────────

  const handleCategorySelected = useCallback(
    async (category: string, inactivityPeriod?: string) => {
      setState((prev) => ({ ...prev, category, inactivityPeriod }));
      setLoadingTemplate(true);
      setError(null);

      try {
        const response = await getTemplates(category);
        setState((prev) => ({
          ...prev,
          template: response.template,
          message: prev.message || response.template,
        }));
        setStep("editor");
      } catch {
        setError("Gagal memuat template. Silakan coba lagi.");
      } finally {
        setLoadingTemplate(false);
      }
    },
    []
  );

  // ─── Recipient count callback from CategorySelector ──────────────────────

  const handleRecipientCount = useCallback(
    (count: number, sampleRecipient?: { name: string; whatsapp: string }) => {
      setState((prev) => ({
        ...prev,
        recipientCount: count,
        sampleRecipientName: sampleRecipient?.name || "Pelanggan",
      }));
    },
    []
  );

  // ─── Editor → Confirmation (or direct send for single member) ─────────────

  const handleEditorSend = useCallback(async () => {
    if (singleMember) {
      // For single member, skip confirmation and send directly
      setError(null);
      setLoadingTemplate(true);
      try {
        await sendSingle({
          memberId: singleMember.id,
          category: state.category,
          message: state.message,
        });
        // Single send succeeded — close modal (no progress tracking needed)
        handleClose();
      } catch {
        setError("Gagal mengirim pesan. Silakan coba lagi.");
      } finally {
        setLoadingTemplate(false);
      }
    } else {
      setStep("confirmation");
    }
  }, [singleMember, state.category, state.message, handleClose]);

  // ─── Message change from editor ──────────────────────────────────────────

  const handleMessageChange = useCallback((message: string) => {
    setState((prev) => ({ ...prev, message }));
  }, []);

  // ─── Back navigation ─────────────────────────────────────────────────────

  const handleEditorBack = useCallback(() => {
    if (singleMember) {
      handleClose();
    } else {
      setStep("category");
    }
  }, [singleMember, handleClose]);

  const handleConfirmationCancel = useCallback(() => {
    setStep("editor");
  }, []);

  // ─── Confirm blast execution (called by BlastConfirmation with jobId) ────

  const handleConfirm = useCallback(
    (jobId: string) => {
      setError(null);
      // BlastConfirmation already called createBlast and returned the jobId
      setState((prev) => ({ ...prev, jobId }));
      setStep("progress");
    },
    []
  );

  // ─── Step title mapping ──────────────────────────────────────────────────

  const getStepTitle = (): string => {
    switch (step) {
      case "category":
        return "Blast WhatsApp";
      case "editor":
        return "Edit Pesan";
      case "confirmation":
        return "Konfirmasi Blast";
      case "progress":
        return "Mengirim Pesan";
      default:
        return "Blast WhatsApp";
    }
  };

  const getStepDescription = (): string => {
    switch (step) {
      case "category":
        return "Pilih kategori pesan yang ingin dikirim";
      case "editor":
        return "Edit dan preview pesan sebelum dikirim";
      case "confirmation":
        return "Pastikan semua data sudah benar sebelum mengirim";
      case "progress":
        return "Pesan sedang dikirim ke penerima";
      default:
        return "";
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Error banner */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Loading template state */}
          {loadingTemplate && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-slate-500">Memuat template...</p>
            </div>
          )}

          {/* Step: Category Selection */}
          {step === "category" && !loadingTemplate && (
            <BlastCategorySelector
              onCategorySelected={handleCategorySelected}
              onRecipientCount={handleRecipientCount}
            />
          )}

          {/* Step: Template Editor */}
          {step === "editor" && !loadingTemplate && (
            <BlastTemplateEditor
              category={state.category as "reminder" | "promo" | "announcement" | "custom"}
              template={state.message || state.template}
              sampleRecipientName={state.sampleRecipientName}
              onMessageChange={handleMessageChange}
              onSend={handleEditorSend}
              onBack={handleEditorBack}
            />
          )}

          {/* Step: Confirmation */}
          {step === "confirmation" && (
            <BlastConfirmation
              category={state.category as "reminder" | "promo" | "announcement" | "custom"}
              inactivityPeriod={state.inactivityPeriod as "1week" | "1month" | "3months" | undefined}
              message={state.message}
              recipientCount={state.recipientCount}
              sampleRecipientName={state.sampleRecipientName}
              onConfirm={handleConfirm}
              onCancel={handleConfirmationCancel}
            />
          )}

          {/* Step: Progress */}
          {step === "progress" && (
            <BlastProgressBar
              jobId={state.jobId}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

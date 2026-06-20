"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, MessageSquare, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BlastTemplateEditorProps {
  category: "reminder" | "promo" | "announcement" | "custom";
  template: string;
  sampleRecipientName: string;
  onMessageChange: (message: string) => void;
  onSend: () => void;
  onBack: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_CHARACTERS = 1000;
const DEBOUNCE_MS = 500;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolvePreview(message: string, recipientName: string): string {
  const name = recipientName.trim() || "Pelanggan";
  return message.replace(/\{\{nama\}\}/g, name);
}

function getCharCountColor(length: number): string {
  if (length > 950) return "text-red-600";
  if (length >= 800) return "text-amber-600";
  return "text-green-600";
}

function isMessageValid(message: string): boolean {
  return message.trim().length > 0 && message.length <= MAX_CHARACTERS;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BlastTemplateEditor({
  category,
  template,
  sampleRecipientName,
  onMessageChange,
  onSend,
  onBack,
}: BlastTemplateEditorProps) {
  const [message, setMessage] = useState<string>(template);
  const [preview, setPreview] = useState<string>(
    resolvePreview(template, sampleRecipientName)
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update preview with 500ms debounce
  const updatePreview = useCallback(
    (text: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        setPreview(resolvePreview(text, sampleRecipientName));
      }, DEBOUNCE_MS);
    },
    [sampleRecipientName]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Handle text area changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Enforce max length
    if (value.length > MAX_CHARACTERS) return;

    setMessage(value);
    onMessageChange(value);
    updatePreview(value);
  };

  const categoryLabels: Record<string, string> = {
    reminder: "Reminder",
    promo: "Promo Terbaru",
    announcement: "Announcement",
    custom: "Custom",
  };

  const sendDisabled = !isMessageValid(message);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
            aria-label="Kembali ke pilihan kategori"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-bold text-slate-800">
            {categoryLabels[category]}
          </h3>
        </div>
        <div
          className={cn(
            "text-xs font-semibold tabular-nums",
            getCharCountColor(message.length)
          )}
        >
          {message.length} / {MAX_CHARACTERS}
        </div>
      </div>

      {/* Custom category: placeholder usage guide */}
      {category === "custom" && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <Info className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-semibold mb-1">Panduan placeholder:</p>
            <p>
              Gunakan{" "}
              <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-blue-800">
                {"{{nama}}"}
              </code>{" "}
              untuk menambahkan nama penerima secara otomatis.
            </p>
            <p className="mt-1 text-blue-600">
              Contoh: Halo {"{{nama}}"}, terima kasih sudah jadi pelanggan setia kami!
            </p>
          </div>
        </div>
      )}

      {/* Editor section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Textarea */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="blast-message"
            className="text-xs font-semibold text-slate-600"
          >
            Isi Pesan
          </label>
          <textarea
            id="blast-message"
            value={message}
            onChange={handleChange}
            maxLength={MAX_CHARACTERS}
            rows={12}
            placeholder={
              category === "custom"
                ? "Tulis pesan kamu di sini... Gunakan {{nama}} untuk nama penerima."
                : "Tulis pesan kamu..."
            }
            className={cn(
              "w-full resize-none rounded-lg border border-slate-200 bg-white p-3",
              "text-sm text-slate-800 placeholder:text-slate-400",
              "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
              "transition-colors"
            )}
            aria-describedby="char-counter"
          />
          <p id="char-counter" className="sr-only">
            {message.length} dari {MAX_CHARACTERS} karakter terpakai
          </p>
        </div>

        {/* Live preview */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-600">
            Preview Pesan
          </label>
          <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
            {/* Phone message bubble */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-slate-500">
                  WhatsApp Preview
                </span>
              </div>
              <div className="rounded-lg bg-green-100 border border-green-200 p-3 max-w-full">
                <p className="text-sm text-slate-800 whitespace-pre-wrap break-words leading-relaxed">
                  {preview || (
                    <span className="text-slate-400 italic">
                      Pesan kosong — tulis pesan di sebelah kiri
                    </span>
                  )}
                </p>
              </div>
              {sampleRecipientName && (
                <p className="text-xs text-slate-400 mt-1">
                  Preview menggunakan nama:{" "}
                  <span className="font-medium text-slate-500">
                    {sampleRecipientName}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Button
          size="sm"
          onClick={onSend}
          disabled={sendDisabled}
          className="gap-2"
          aria-label={
            sendDisabled
              ? "Isi pesan terlebih dahulu untuk mengirim blast"
              : "Kirim blast WhatsApp"
          }
        >
          <Send className="h-4 w-4" />
          Send Blast
        </Button>
      </div>

      {/* Validation message for empty content */}
      {message.trim().length === 0 && message.length > 0 && (
        <p className="text-xs text-red-500 -mt-3">
          Pesan tidak boleh hanya berisi spasi. Tambahkan konten yang bermakna.
        </p>
      )}
    </div>
  );
}

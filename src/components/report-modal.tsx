"use client";

import { useState, useEffect, useTransition } from "react";
import { reportContent } from "@/app/actions/report";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "post" | "comment" | "profile" | "story";
  targetId: string;
}

const categories = [
  { value: "spam", label: "Spam", desc: "Misleading or repetitive content" },
  { value: "abuse", label: "Abuse", desc: "Harmful or threatening behavior" },
  {
    value: "fake_account",
    label: "Fake Account",
    desc: "Impersonation or fake identity",
  },
  {
    value: "harassment",
    label: "Harassment",
    desc: "Bullying or targeted harassment",
  },
  { value: "other", label: "Other", desc: "Something else" },
];

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
}: ReportModalProps) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setCategory("");
      setDescription("");
      setSubmitted(false);
    }
  }, [isOpen]);

  function handleSubmit() {
    if (!category) return;
    startTransition(async () => {
      try {
        await reportContent(
          targetType,
          targetId,
          category,
          description || undefined
        );
        setSubmitted(true);
        setTimeout(() => onClose(), 2000);
      } catch {
        // silent fail
      }
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Report Submitted
            </h3>
            <p className="text-sm text-muted-foreground">
              Thank you. We&apos;ll review this {targetType} shortly.
            </p>
          </div>
        ) : (
          <>
            <h2 className="mb-1 text-lg font-bold text-foreground">
              Report {targetType}
            </h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Why are you reporting this {targetType}?
            </p>

            <div className="space-y-2 mb-4">
              {categories.map((cat) => (
                <label
                  key={cat.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                    category === cat.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="report-category"
                    value={cat.value}
                    checked={category === cat.value}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-0.5 accent-primary"
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {cat.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {cat.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details (optional)"
              rows={3}
              className="mb-4 w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />

            <button
              onClick={handleSubmit}
              disabled={!category || isPending}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              {isPending ? "Submitting..." : "Submit Report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

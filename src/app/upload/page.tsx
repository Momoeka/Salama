"use client";

import { useState, useRef, useCallback } from "react";
import { uploadPost } from "./actions";

const IMAGE_FILTERS = [
  { name: "Normal", css: "none" },
  { name: "Clarendon", css: "brightness(1.2) contrast(1.1) saturate(1.3)" },
  { name: "Gingham", css: "brightness(1.05) hue-rotate(-10deg) saturate(0.7)" },
  { name: "Moon", css: "brightness(1.1) contrast(1.1) saturate(0)" },
  { name: "Lark", css: "brightness(1.15) contrast(0.9) saturate(1.2)" },
  { name: "Reyes", css: "brightness(1.1) contrast(0.85) saturate(0.75) sepia(0.22)" },
  { name: "Juno", css: "brightness(1.1) contrast(1.15) saturate(1.4)" },
  { name: "Slumber", css: "brightness(1.05) saturate(0.66) contrast(0.88)" },
  { name: "Crema", css: "brightness(1.05) contrast(0.95) saturate(0.9) sepia(0.15)" },
  { name: "Ludwig", css: "brightness(1.05) contrast(1.05) saturate(1.2)" },
  { name: "Aden", css: "brightness(1.2) contrast(0.9) saturate(0.85) hue-rotate(20deg)" },
  { name: "Perpetua", css: "brightness(1.1) saturate(1.1)" },
] as const;

async function applyFilterToFile(
  file: File,
  filterCss: string,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.filter = filterCss;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not export canvas to blob"));
            return;
          }
          resolve(new File([blob], file.name, { type: file.type || "image/png" }));
        },
        file.type || "image/png",
        0.92,
      );
    };
    img.onerror = () => reject(new Error("Failed to load image for filter processing"));
    img.src = URL.createObjectURL(file);
  });
}

export default function UploadPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [locationName, setLocationName] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("none");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFile = useRef<File | null>(null);

  function handleFileSelect(file: File) {
    const isMediaFile =
      file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!isMediaFile) return;

    selectedFile.current = file;
    setIsVideo(file.type.startsWith("video/"));
    setPreview(URL.createObjectURL(file));
    setSelectedFilter("none");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  async function handleSubmit(status: "published" | "scheduled" | "draft") {
    if (!selectedFile.current || !caption.trim()) {
      setError("Please select an image and write a caption.");
      return;
    }

    if (status === "scheduled" && !scheduledAt) {
      setError("Please select a date and time for scheduling.");
      return;
    }

    if (pollEnabled) {
      if (!pollQuestion.trim()) {
        setError("Please enter a poll question.");
        return;
      }
      const validOptions = pollOptions.filter((o) => o.trim());
      if (validOptions.length < 2) {
        setError("Please provide at least 2 poll options.");
        return;
      }
    }

    setUploading(true);
    setError(null);

    try {
      let fileToUpload = selectedFile.current;

      // Bake the filter into the image if a filter is selected (skip for videos)
      if (selectedFilter !== "none" && !isVideo) {
        fileToUpload = await applyFilterToFile(fileToUpload, selectedFilter);
      }

      const formData = new FormData();
      formData.append("image", fileToUpload);
      formData.append("caption", caption);
      formData.append("visibility", visibility);
      formData.append("status", status);
      if (status === "scheduled" && scheduledAt) {
        formData.append("scheduled_at", new Date(scheduledAt).toISOString());
      }
      if (locationName.trim()) {
        formData.append("location_name", locationName.trim());
      }
      if (pollEnabled && pollQuestion.trim()) {
        const validOptions = pollOptions.filter((o) => o.trim());
        if (validOptions.length >= 2) {
          formData.append("poll_question", pollQuestion.trim());
          formData.append("poll_options", JSON.stringify(validOptions));
        }
      }
      await uploadPost(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
    }
  }

  // Get the minimum datetime for the scheduler (now + 5 minutes)
  function getMinDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  }

  const canSubmit = !!preview && !!caption.trim() && !uploading;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-foreground">
        Upload a Post
      </h1>

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          {preview ? (
            isVideo ? (
              <video
                src={preview}
                className="max-h-[400px] rounded-xl object-contain"
                muted
                playsInline
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="max-h-[400px] rounded-xl object-contain"
                style={{
                  filter: selectedFilter !== "none" ? selectedFilter : undefined,
                }}
              />
            )
          ) : (
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-4 text-muted-foreground"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
              <p className="mb-1 font-medium text-foreground">
                Drag & drop your image here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse (PNG, JPG, WebP up to 50MB)
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Filter strip - only for images */}
        {preview && !isVideo && (
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Filters
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {IMAGE_FILTERS.map((filter) => (
                <button
                  key={filter.name}
                  type="button"
                  onClick={() => setSelectedFilter(filter.css)}
                  className="flex flex-shrink-0 flex-col items-center gap-1"
                >
                  <div
                    className={`h-[60px] w-[60px] overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedFilter === filter.css
                        ? "border-primary"
                        : "border-border"
                    }`}
                  >
                    <img
                      src={preview}
                      alt={filter.name}
                      className="h-full w-full object-cover"
                      style={{
                        filter:
                          filter.css !== "none" ? filter.css : undefined,
                      }}
                    />
                  </div>
                  <span
                    className={`text-[10px] ${
                      selectedFilter === filter.css
                        ? "font-semibold text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {filter.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {preview && (
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              selectedFile.current = null;
              setSelectedFilter("none");
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Remove image
          </button>
        )}

        {/* Caption */}
        <div>
          <label
            htmlFor="caption"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            placeholder="Write a caption for your image..."
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Visibility
          </label>
          <div className="flex gap-3">
            {(["public", "followers", "private"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setVisibility(opt)}
                className={`rounded-lg border px-4 py-2 text-sm capitalize transition-colors ${
                  visibility === opt
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <button
            type="button"
            onClick={() => setShowLocationInput(!showLocationInput)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
              showLocationInput || locationName
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {locationName ? locationName : "Add Location"}
          </button>
          {showLocationInput && (
            <div className="mt-3">
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Enter location name..."
                className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {locationName && (
                <button
                  type="button"
                  onClick={() => {
                    setLocationName("");
                    setShowLocationInput(false);
                  }}
                  className="mt-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Remove location
                </button>
              )}
            </div>
          )}
        </div>

        {/* Poll Toggle */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Add a Poll</p>
              <p className="text-xs text-muted-foreground">
                Let your audience vote on a question
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPollEnabled(!pollEnabled);
                if (pollEnabled) {
                  setPollQuestion("");
                  setPollOptions(["", ""]);
                }
              }}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                pollEnabled ? "bg-violet-500" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  pollEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {pollEnabled && (
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />

              {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[index] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        setPollOptions(pollOptions.filter((_, i) => i !== index))
                      }
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" x2="6" y1="6" y2="18" />
                        <line x1="6" x2="18" y1="6" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}

              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" x2="12" y1="5" y2="19" />
                    <line x1="5" x2="19" y1="12" y2="12" />
                  </svg>
                  Add option
                </button>
              )}
            </div>
          )}
        </div>

        {/* Schedule Toggle */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Schedule for later
            </label>
            <button
              type="button"
              onClick={() => {
                setScheduleEnabled(!scheduleEnabled);
                if (scheduleEnabled) setScheduledAt("");
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                scheduleEnabled ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  scheduleEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {scheduleEnabled && (
            <div className="mt-3">
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={getMinDateTime()}
                className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Your post will be published automatically at the scheduled time.
              </p>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              handleSubmit(
                scheduleEnabled && scheduledAt ? "scheduled" : "published"
              )
            }
            className="flex-1 rounded-xl bg-primary py-3 text-base font-semibold text-primary-foreground transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Uploading...
              </span>
            ) : scheduleEnabled && scheduledAt ? (
              "Schedule Post"
            ) : (
              "Upload Now"
            )}
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => handleSubmit("draft")}
            className="rounded-xl border border-border px-6 py-3 text-base font-semibold text-foreground transition-all hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  );
}

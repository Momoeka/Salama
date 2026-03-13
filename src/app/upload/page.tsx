"use client";

import { useState, useRef } from "react";
import { uploadPost } from "./actions";

export default function UploadPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFile = useRef<File | null>(null);

  function handleFileSelect(file: File) {
    const isMediaFile =
      file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!isMediaFile) return;

    selectedFile.current = file;
    setIsVideo(file.type.startsWith("video/"));
    setPreview(URL.createObjectURL(file));
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile.current || !caption.trim()) {
      setError("Please select an image and write a caption.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile.current);
      formData.append("caption", caption);
      formData.append("visibility", visibility);
      await uploadPost(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
    }
  }

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

      <form onSubmit={handleSubmit} className="space-y-6">
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
            <img
              src={preview}
              alt="Preview"
              className="max-h-[400px] rounded-xl object-contain"
            />
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

        {preview && (
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              selectedFile.current = null;
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

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading || !preview || !caption.trim()}
          className="w-full rounded-xl bg-primary py-3 text-base font-semibold text-primary-foreground transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
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
          ) : (
            "Upload Post"
          )}
        </button>
      </form>
    </div>
  );
}

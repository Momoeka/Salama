"use client";

import { useState, useRef } from "react";
import { createStory } from "@/app/actions/stories";

export function StoryUploadModal({ onClose }: { onClose: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<File | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    fileRef.current = file;
    setIsVideo(file.type.startsWith("video/"));
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!fileRef.current) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("media", fileRef.current);
      fd.append("caption", caption);
      await createStory(fd);
      onClose();
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to create story");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Add to Your Story
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {!preview ? (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/50 p-12 transition-colors hover:border-primary/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mb-3 text-muted-foreground"
            >
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
              <line x1="16" x2="22" y1="5" y2="5" />
              <line x1="19" x2="19" y1="2" y2="8" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span className="text-sm text-muted-foreground">
              Tap to add photo or video
            </span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        ) : (
          <div className="overflow-hidden rounded-xl">
            {isVideo ? (
              <video
                src={preview}
                className="aspect-[9/16] w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={preview}
                alt="Story preview"
                className="aspect-[9/16] w-full object-cover"
              />
            )}
          </div>
        )}

        {preview && (
          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPreview(null);
                  fileRef.current = null;
                }}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Change
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50"
              >
                {uploading ? "Sharing..." : "Share Story"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

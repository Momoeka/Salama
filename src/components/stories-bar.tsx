"use client";

import { useState, useRef } from "react";
import { createStory, type UserWithStories } from "@/app/actions/stories";
import { StoryViewer } from "./story-viewer";

interface StoriesBarProps {
  storiesData: UserWithStories[];
}

export function StoriesBar({ storiesData }: StoriesBarProps) {
  const [stories, setStories] = useState<UserWithStories[]>(storiesData);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeUserIndex, setActiveUserIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function openStory(userIndex: number) {
    setActiveUserIndex(userIndex);
    setViewerOpen(true);
  }

  async function handleAddStory(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isMedia =
      file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!isMedia) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("caption", "");
      await createStory(formData);
      // Refresh the page to get updated stories
      window.location.reload();
    } catch (err) {
      console.error("Failed to create story:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <div className="mb-8 rounded-2xl border border-border bg-card p-4">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Add Your Story button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex flex-shrink-0 flex-col items-center gap-1.5"
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-primary/50 bg-secondary transition-colors hover:border-primary hover:bg-primary/10">
              {uploading ? (
                <svg
                  className="h-6 w-6 animate-spin text-primary"
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
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <line x1="12" x2="12" y1="5" y2="19" />
                  <line x1="5" x2="19" y1="12" y2="12" />
                </svg>
              )}
            </div>
            <span className="max-w-[72px] truncate text-xs text-muted-foreground">
              Your Story
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleAddStory}
            className="hidden"
          />

          {/* Story circles for each user */}
          {stories.map((userStories, index) => (
            <button
              key={userStories.user_id}
              onClick={() => openStory(index)}
              className="flex flex-shrink-0 flex-col items-center gap-1.5"
            >
              <div className="rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-[2.5px]">
                <div className="rounded-full bg-card p-[2px]">
                  {userStories.avatar_url ? (
                    <img
                      src={userStories.avatar_url}
                      alt={userStories.username}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {userStories.username?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
              </div>
              <span className="max-w-[72px] truncate text-xs text-muted-foreground">
                {userStories.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {viewerOpen && stories.length > 0 && (
        <StoryViewer
          allUserStories={stories}
          initialUserIndex={activeUserIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}

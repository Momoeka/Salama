"use client";

import { useState, useEffect, useTransition } from "react";
import { createCollection, addToCollection, getCollections } from "@/app/actions/collections";
import { toggleSavePost } from "@/app/actions/saved";

interface Collection {
  id: string;
  name: string;
  postCount: number;
  coverImages: string[];
}

interface SaveToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export function SaveToCollectionModal({
  isOpen,
  onClose,
  postId,
}: SaveToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getCollections()
        .then((c) => setCollections(c as Collection[]))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSaveToCollection(collectionId: string) {
    startTransition(async () => {
      await toggleSavePost(postId);
      await addToCollection(collectionId, postId);
      onClose();
    });
  }

  function handleQuickSave() {
    startTransition(async () => {
      await toggleSavePost(postId);
      onClose();
    });
  }

  function handleCreate() {
    if (!newName.trim()) return;
    startTransition(async () => {
      const col = await createCollection(newName.trim());
      await toggleSavePost(postId);
      await addToCollection(col.id, postId);
      setNewName("");
      setShowCreate(false);
      onClose();
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose} />
      <div className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-md rounded-t-2xl border border-border bg-card sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Save to collection"
      >
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-center text-sm font-semibold text-foreground">
            Save to...
          </h3>
        </div>

        <div className="max-h-64 overflow-y-auto p-4">
          {/* Quick save (no collection) */}
          <button
            onClick={handleQuickSave}
            disabled={isPending}
            className="mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-secondary transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Quick Save</p>
              <p className="text-xs text-muted-foreground">Save without a collection</p>
            </div>
          </button>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
          ) : (
            collections.map((col) => (
              <button
                key={col.id}
                onClick={() => handleSaveToCollection(col.id)}
                disabled={isPending}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-secondary transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                  {col.coverImages[0] ? (
                    <img
                      src={col.coverImages[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{col.name}</p>
                  <p className="text-xs text-muted-foreground">{col.postCount} posts</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Create new collection */}
        <div className="border-t border-border p-4">
          {showCreate ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Collection name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                Create
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="flex w-full items-center gap-2 text-sm font-semibold text-primary hover:opacity-70"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" x2="12" y1="5" y2="19" />
                <line x1="5" x2="19" y1="12" y2="12" />
              </svg>
              New Collection
            </button>
          )}
        </div>
      </div>
    </>
  );
}

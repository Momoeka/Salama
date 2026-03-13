import { getCollections } from "@/app/actions/collections";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-bold text-foreground">Your Collections</h1>

      {collections.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-muted-foreground" aria-hidden="true">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
          <p className="text-muted-foreground">No collections yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Save posts to organize them into collections
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {collections.map((col: any) => (
            <Link
              key={col.id}
              href={`/profile/collections/${col.id}`}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-secondary"
            >
              <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="bg-secondary">
                    {col.coverImages[i] ? (
                      <img
                        src={col.coverImages[i]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-foreground truncate">
                  {col.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {col.postCount} {col.postCount === 1 ? "post" : "posts"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

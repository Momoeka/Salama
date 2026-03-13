import { NextRequest, NextResponse } from "next/server";
import { getOptimizedUrl } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const w = searchParams.get("w");
  const q = searchParams.get("q");

  if (!url) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  const optimized = getOptimizedUrl(url, {
    width: w ? parseInt(w) : undefined,
    quality: q || undefined,
  });

  // Redirect to the Cloudinary URL
  return NextResponse.redirect(optimized, 302);
}

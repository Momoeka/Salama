"use client";

import { getOptimizedUrl, getResponsiveSrcSet } from "@/lib/cloudinary";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  loading?: "lazy" | "eager";
  onClick?: () => void;
  onDoubleClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * Renders an optimized image. If Cloudinary is configured, uses Cloudinary fetch
 * for auto-format, auto-quality, and responsive sizing.
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  loading,
  onClick,
  onDoubleClick,
  style,
}: OptimizedImageProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // If Cloudinary isn't configured, render a standard img
  if (!cloudName) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? "eager" : loading || "lazy"}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        style={style}
      />
    );
  }

  const optimizedSrc = getOptimizedUrl(src, { width, height });
  const srcSet = getResponsiveSrcSet(src);

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : loading || "lazy"}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={style}
    />
  );
}

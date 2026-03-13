interface VerifiedBadgeProps {
  size?: "xs" | "sm" | "md" | "lg";
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
};

export function VerifiedBadge({ size = "sm" }: VerifiedBadgeProps) {
  const px = sizeMap[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block flex-shrink-0"
      aria-label="Verified"
      role="img"
    >
      <circle cx="12" cy="12" r="12" fill="#1d9bf0" />
      <path
        d="M9.5 12.5L11 14L15 10"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

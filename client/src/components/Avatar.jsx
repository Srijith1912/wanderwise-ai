import { useEffect, useState } from "react";

const PALETTE = [
  "from-forest-500 to-forest-700",
  "from-terracotta-500 to-terracotta-700",
  "from-coral-500 to-coral-700",
  "from-forest-400 to-terracotta-500",
  "from-terracotta-400 to-coral-500",
];

const initialsFor = (name = "?") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

const gradientFor = (seed = "") => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
};

const SIZE_CLASSES = {
  xs: "w-8 h-8 text-xs",
  sm: "w-10 h-10 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-20 h-20 text-2xl",
  xl: "w-28 h-28 text-3xl",
};

export default function Avatar({
  name,
  src,
  size = "sm",
  ring = false,
  className = "",
}) {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;
  const ringClass = ring ? "ring-2 ring-white shadow-soft" : "";

  // Reset failed flag whenever the src prop changes so a new URL gets a fresh attempt.
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = src && !failed;

  if (showImage) {
    return (
      <img
        src={src}
        alt={name || "User"}
        onError={() => setFailed(true)}
        className={`${sizeClass} ${ringClass} rounded-full object-cover bg-cream-200 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${ringClass} rounded-full bg-gradient-to-br ${gradientFor(
        name || "?",
      )} text-white font-semibold flex items-center justify-center select-none shrink-0 ${className}`}
    >
      {initialsFor(name)}
    </div>
  );
}

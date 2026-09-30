import { cn } from "@/lib/utils";

type LogoKevenProps = {
  className?: string;
  title?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "text-base",
  md: "text-lg sm:text-xl",
  lg: "text-2xl sm:text-3xl",
} as const;

export function LogoKeven({
  className,
  title = "Keven Miano",
  size = "md",
}: LogoKevenProps) {
  return (
    <span
      className={cn(
        "inline-flex font-[family-name:var(--font-display)] font-extrabold tracking-[-0.04em] text-black",
        sizeMap[size],
        className,
      )}
      role="img"
      aria-label={title}
    >
      {title}
    </span>
  );
}

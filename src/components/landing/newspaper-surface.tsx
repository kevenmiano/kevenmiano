import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type NewspaperSurfaceProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">;

export function NewspaperSurface({
  children,
  className,
  contentClassName,
  ...props
}: NewspaperSurfaceProps) {
  return (
    <div
      {...props}
      className={cn(
        "relative overflow-hidden rounded-none bg-[var(--lp-paper-news)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="lp-news-bg pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
      >
        <div className="lp-news-texture absolute inset-0" />
        <div className="lp-news-bg-hatch absolute inset-0" />
        <div className="lp-news-bg-veil absolute inset-0" />
      </div>
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
}

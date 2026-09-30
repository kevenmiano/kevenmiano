import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function withBasePath(path: string): string {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.startsWith("http")
  ) {
    return path;
  }

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path}`;
}

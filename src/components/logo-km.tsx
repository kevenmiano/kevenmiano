import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoKmProps = {
  className?: string;
  title?: string;
};

export function LogoKm({ className, title = "Keven Miano" }: LogoKmProps) {
  return (
    <Image
      src="/images/keven-miano-signature.png"
      alt={title}
      width={148}
      height={38}
      className={cn("h-auto w-auto object-contain object-left", className)}
      priority
    />
  );
}

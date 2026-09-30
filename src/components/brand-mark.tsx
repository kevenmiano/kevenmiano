import Image from "next/image";
import { cn, withBasePath } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  title?: string;
};

export function BrandMark({
  className,
  title = "Keven Miano",
}: BrandMarkProps) {
  return (
    <Image
      src={withBasePath("/images/keven-miano-signature.png")}
      alt={title}
      width={148}
      height={38}
      className={cn("h-auto w-auto object-contain object-left", className)}
      priority
    />
  );
}

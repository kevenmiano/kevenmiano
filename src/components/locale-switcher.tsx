"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn("inline-flex h-full min-h-11 items-stretch lg:min-h-12", className)}
    >
      <span
        data-lp-chrome="chip"
        className="hidden items-center border-r-[3px] border-black bg-[var(--lp-hud-raised)] px-2.5 font-[family-name:var(--font-display)] text-[0.6rem] font-extrabold tracking-[0.2em] text-white/45 uppercase sm:inline-flex lg:px-3"
      >
        Lang
      </span>
      {routing.locales.map((item, index) => {
        const active = item === locale;
        return (
          <button
            key={item}
            type="button"
            data-lp-chrome="btn"
            aria-pressed={active}
            onClick={() => switchLocale(item)}
            className={cn(
              "relative inline-flex min-w-11 items-center justify-center px-3 font-[family-name:var(--font-display)] text-[0.7rem] font-extrabold tracking-[0.16em] uppercase transition-colors lg:min-w-12 lg:text-[0.75rem]",
              index > 0 && "border-l-[3px] border-black",
              active
                ? "bg-[var(--lp-accent)] text-black"
                : "bg-[var(--lp-hud)] text-white/45 hover:bg-[var(--lp-hud-raised)] hover:text-[var(--lp-accent)]",
            )}
          >
            {t(item)}
            {active ? (
              <>
                <span
                  className="pointer-events-none absolute top-1 left-1 size-1.5 border-t-2 border-l-2 border-black"
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute right-1 bottom-1 size-1.5 border-r-2 border-b-2 border-black"
                  aria-hidden
                />
              </>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

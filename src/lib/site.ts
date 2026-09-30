import { getPathname } from "@/i18n/navigation";
import { type Locale, routing } from "@/i18n/routing";

export const siteConfig = {
  name: "Keven Miano",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://kevenmiano.github.io/kevenmiano",
  ogImage: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/keven-hero-cutout.png`,
} as const;

export const localeHtmlLang: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en",
};

export const localeOpenGraph: Record<Locale, string> = {
  pt: "pt_BR",
  en: "en_US",
};

export const localeHreflang: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en",
};

export function getLocalizedPathname(locale: Locale, href: "/" = "/") {
  return getPathname({ locale, href });
}

export function getLocalizedUrl(locale: Locale, href: "/" = "/") {
  const pathname = getLocalizedPathname(locale, href).replace(/^\//, "");
  const root = siteConfig.url.endsWith("/")
    ? siteConfig.url
    : `${siteConfig.url}/`;
  return new URL(pathname, root).toString();
}

export function getLanguageAlternates(href: "/" = "/") {
  const languages: Record<string, string> = {
    "x-default": getLocalizedUrl(routing.defaultLocale, href),
  };

  for (const locale of routing.locales) {
    languages[localeHreflang[locale]] = getLocalizedUrl(locale, href);
  }

  return languages;
}

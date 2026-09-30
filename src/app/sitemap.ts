import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routing.locales.map((locale: Locale) => ({
    url: getLocalizedUrl(locale),
    lastModified,
    changeFrequency: "monthly",
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: {
      languages: getLanguageAlternates(),
    },
  }));
}

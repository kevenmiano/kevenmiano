import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { DM_Sans, Saira_Extra_Condensed, Space_Grotesk, Syne } from "next/font/google";
import { ScrollReset } from "@/components/scroll-reset";
import { routing, type Locale } from "@/i18n/routing";
import {
  getLanguageAlternates,
  getLocalizedUrl,
  localeHtmlLang,
  localeOpenGraph,
  siteConfig,
} from "@/lib/site";
import { cn } from "@/lib/utils";
import "../globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sign",
  weight: ["500", "600", "700"],
});

const sairaExtraCondensed = Saira_Extra_Condensed({
  subsets: ["latin"],
  variable: "--font-condensed",
  weight: ["700", "800", "900"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Metadata");
  const tProfile = await getTranslations("Profile");
  const canonical = getLocalizedUrl(locale);
  const languages = getLanguageAlternates();
  const ogLocales = routing.locales.filter((item) => item !== locale);

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t("title"),
      template: `%s · ${t("siteName")}`,
    },
    description: t("description"),
    keywords: t("keywords")
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    authors: [{ name: tProfile("fullName"), url: tProfile("linkedin") }],
    creator: tProfile("fullName"),
    publisher: tProfile("fullName"),
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      locale: localeOpenGraph[locale],
      alternateLocale: ogLocales.map((item) => localeOpenGraph[item]),
      url: canonical,
      siteName: t("siteName"),
      title: t("title"),
      description: t("description"),
      images: [
        {
          url: siteConfig.ogImage,
          width: 800,
          height: 1000,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [
        {
          url: siteConfig.ogImage,
          alt: t("ogImageAlt"),
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

type Props = {
  children: React.ReactNode;
};

export default async function LocaleLayout({ children }: Props) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Metadata");
  const tProfile = await getTranslations("Profile");
  const canonical = getLocalizedUrl(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: tProfile("fullName"),
    alternateName: tProfile("name"),
    url: canonical,
    image: new URL(siteConfig.ogImage, siteConfig.url).toString(),
    jobTitle: tProfile("role"),
    description: t("description"),
    email: tProfile("email"),
    telephone: tProfile("phoneHref").replace("tel:", ""),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Londrina",
      addressRegion: "PR",
      addressCountry: "BR",
    },
    sameAs: [tProfile("linkedin")],
    knowsAbout: [
      "Software Engineering",
      "Backend",
      "Full Stack",
      "React",
      "Next.js",
      "Go",
      "Node.js",
      "NestJS",
      "Cloud",
      "IoT",
      "Artificial Intelligence",
    ],
  };

  const assetBase = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <html
      lang={localeHtmlLang[locale]}
      className={cn(
        "h-full antialiased",
        syne.variable,
        dmSans.variable,
        spaceGrotesk.variable,
        sairaExtraCondensed.variable,
      )}
    >
      <body className="relative isolate min-h-full font-[family-name:var(--font-body)]">
        <style
          dangerouslySetInnerHTML={{
            __html: `
@media (pointer: fine) {
  :root {
    --cursor-default: url("${assetBase}/images/cursors/cursor-default.svg") 6 2, auto;
    --cursor-pointer: url("${assetBase}/images/cursors/cursor-pointer.svg") 16 16, pointer;
    --cursor-text: url("${assetBase}/images/cursors/cursor-text.svg") 16 16, text;
    --cursor-grab: url("${assetBase}/images/cursors/cursor-grab.svg") 16 16, grab;
    --cursor-grabbing: url("${assetBase}/images/cursors/cursor-grab.svg") 16 16, grabbing;
  }
  html.lp-cyberpunk {
    --cursor-default: url("${assetBase}/images/cursors/cyber-default.svg") 6 2, auto;
    --cursor-pointer: url("${assetBase}/images/cursors/cyber-pointer.svg") 16 16, pointer;
    --cursor-text: url("${assetBase}/images/cursors/cyber-text.svg") 16 16, text;
    --cursor-grab: url("${assetBase}/images/cursors/cyber-grab.svg") 16 16, grab;
    --cursor-grabbing: url("${assetBase}/images/cursors/cyber-grab.svg") 16 16, grabbing;
  }
}
`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <NextIntlClientProvider>
          <ScrollReset />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

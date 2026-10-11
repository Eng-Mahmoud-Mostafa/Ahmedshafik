import type { Metadata, Viewport } from "next";
import { Archivo, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getHtmlLang, getRequestLocale } from "@/i18n/server";
import { dictionaryFor } from "@/i18n/dictionary";
import { isProductionDeployment } from "@/lib/deployment";
import {
  buildPersonStructuredData,
  PRODUCTION_ORIGIN,
  serializeStructuredData,
} from "@/lib/structured-data";

const display = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const body = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

const arabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["400", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = dictionaryFor(locale);
  const meta = t.meta;
  const indexable = isProductionDeployment();

  return {
    metadataBase: new URL(PRODUCTION_ORIGIN),
    title: meta.title,
    description: meta.description,
    applicationName: "Ahmed Said Shafik",
    authors: [{ name: "Ahmed Said Shafik" }],
    creator: "Ahmed Said Shafik",
    publisher: "Ahmed Said Shafik",
    // Cookie-based routing means English and Arabic share one URL, so there is
    // a single canonical and no hreflang alternates to declare.
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName: "Ahmed Said Shafik",
      title: meta.title,
      description: meta.description,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_EG",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
    // Preview and development deployments are never indexed.
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#05060a",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();
  const dictionary = dictionaryFor(locale);
  const structuredData = buildPersonStructuredData(
    locale,
    dictionary.meta.description,
  );

  return (
    <html
      lang={getHtmlLang(locale)}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${display.variable} ${body.variable} ${arabic.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-ink text-bone antialiased">
        <script
          type="application/ld+json"
          // Serialised from trusted, published content and escaped, so no
          // visitor-supplied string can close the tag.
          dangerouslySetInnerHTML={{
            __html: serializeStructuredData(structuredData),
          }}
        />
        <LocaleProvider initialLocale={locale}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-egypt-red focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-bone"
          >
            {dictionary.nav.skipToContent}
          </a>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}

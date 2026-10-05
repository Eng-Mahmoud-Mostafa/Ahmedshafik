import type { Metadata, Viewport } from "next";
import { Archivo, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getHtmlLang, getRequestLocale } from "@/i18n/server";
import { dictionaryFor } from "@/i18n/dictionary";

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

export const metadata: Metadata = {
  title: "Ahmed Said Shafik — Egyptian Volleyball Outside Hitter",
  description:
    "Official portfolio of Ahmed Said Shafik (أحمد سعيد شفيق) — Egyptian international outside hitter, born 7 December 1994, 190 cm.",
  metadataBase: new URL("https://ahmedshafik.vercel.app"),
  openGraph: {
    title: "Ahmed Said Shafik — Egyptian International Outside Hitter",
    description:
      "Official portfolio of Ahmed Said Shafik (أحمد سعيد شفيق) — Egyptian international outside hitter.",
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_EG",
  },
  robots: { index: true, follow: true },
};

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

  return (
    <html
      lang={getHtmlLang(locale)}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${display.variable} ${body.variable} ${arabic.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-ink text-bone antialiased">
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
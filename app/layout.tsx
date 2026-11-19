import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import Script from "next/script";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { getDictionary, localeFromCookie, type Locale } from "@/lib/i18n";

const ptSans = localFont({
  src: [
    { path: "./fonts/pt-sans-400-cyrillic.woff2", weight: "400", style: "normal" },
    { path: "./fonts/pt-sans-400-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/pt-sans-700-cyrillic.woff2", weight: "700", style: "normal" },
    { path: "./fonts/pt-sans-700-latin.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-pt-sans",
  display: "swap",
});

const ptSerif = localFont({
  src: [
    { path: "./fonts/pt-serif-400-cyrillic.woff2", weight: "400", style: "normal" },
    { path: "./fonts/pt-serif-400-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/pt-serif-700-cyrillic.woff2", weight: "700", style: "normal" },
    { path: "./fonts/pt-serif-700-latin.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-pt-serif",
  display: "swap",
});

const siteUrl = "https://staffbase.de-world.net";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "StaffBase — Система учёта сотрудников компании | ТОО «DeWorld StaffBase»",
    template: "%s — StaffBase",
  },
  description:
    "Внутренняя корпоративная система ТОО «DeWorld StaffBase»: карточки сотрудников, отделы и должности, отпуска и больничные, дашборд и выгрузка CSV. Павлодар, 2026.",
  applicationName: "StaffBase",
  keywords: ["StaffBase", "учёт сотрудников", "кадровый учёт", "DeWorld StaffBase", "HR система Павлодар"],
  authors: [{ name: "ТОО «DeWorld StaffBase»" }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "StaffBase",
    title: "StaffBase — Система учёта сотрудников компании",
    description: "Единая база сотрудников: карточки, отделы, отпуска, отчётность — без бумажных журналов.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#10161c" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)sb_theme=(system|light|dark)/);var t=m?m[1]:"system";if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t;}else{delete document.documentElement.dataset.theme;}}catch(e){}})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jar = await cookies();
  const locale: Locale = localeFromCookie(jar.get("sb_locale")?.value);
  const dict = getDictionary(locale);
  void dict; // словари подключаются в страницах напрямую через getDictionary(locale)

  return (
    <html lang={locale} className={`${ptSans.variable} ${ptSerif.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <Script id="sb-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-bg text-text">
        <a href="#main-content" className="skip-link">К содержанию / Skip to content</a>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}


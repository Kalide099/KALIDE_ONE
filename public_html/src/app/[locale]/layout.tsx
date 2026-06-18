import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import { LanguageProvider } from '../../context/LanguageContext';
import Navbar from '@/components/Navbar';

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ARTISANA - By KALIDE SARL",
  description: "The premium bilingual platform for unified services. Made and maintained by KALIDE SARL.",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${outfit.variable} ${inter.variable} font-sans antialiased text-gray-900 bg-white`}>
        <NextIntlClientProvider messages={messages}>
          <LanguageProvider>
            <Navbar />
            {children}
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

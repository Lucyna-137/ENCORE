import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const googleSans = localFont({
  src: [
    { path: '../fonts/Google_Sans/static/GoogleSans-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/Google_Sans/static/GoogleSans-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../fonts/Google_Sans/static/GoogleSans-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../fonts/Google_Sans/static/GoogleSans-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-google-sans',
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-noto-jp',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "ENCORE UI Kit",
  description: "ENCORE component showcase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${googleSans.variable} ${notoSansJP.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

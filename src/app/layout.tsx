import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import PaletteProvider from "@/components/encore/PaletteProvider";

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
  appleWebApp: {
    capable: true,
    title: 'Grape',
    // black-translucent にすると StatusBar 配下までコンテンツが伸びる（ノッチまで到達）
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // iOS Safari: input フォーカス時の auto-zoom を抑制（ネイティブアプリ感を優先）。
  // ユーザーのピンチズームも無効化されるが、Capacitor WKWebView 挙動とも整合。
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${googleSans.variable} ${notoSansJP.variable}`} suppressHydrationWarning>
      <head>
        {/* ダークモードフラッシュ防止: React hydration より前に data-theme を付与 */}
        <script dangerouslySetInnerHTML={{ __html:
          `(function(){try{var t=localStorage.getItem('grape-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();`
        }} />
        {/* カラースキームフラッシュ防止: 最初のペイント前に CSS 変数を同期的に適用 */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{
var defs=[
['bg','--color-encore-bg','#F5F3FB',1],
['bg-section','--color-encore-bg-section','#EDE9F5',1],
['green','--color-encore-green','#3D1A78',1],
['green-muted','--color-encore-green-muted','#9878CC',1],
['amber','--color-encore-amber','#C04890',1],
['text-sub','--color-encore-text-sub','#3D1A78',0.55],
['text-muted','--color-encore-text-muted','#3D1A78',0.35],
['border','--color-encore-border','#C0B2D8',1],
['border-light','--color-encore-border-light','#E0DAF0',1],
['white','--color-encore-white','#FFFFFF',1]
];
var saved=null;
try{var raw=localStorage.getItem('encore-palette-v2');if(raw)saved=JSON.parse(raw);}catch(e){}
for(var i=0;i<defs.length;i++){
var d=defs[i],v=saved&&saved[d[0]]?saved[d[0]]:{hex:d[2],alpha:d[3]};
var rr=parseInt(v.hex.slice(1,3),16),gg=parseInt(v.hex.slice(3,5),16),bb=parseInt(v.hex.slice(5,7),16);
document.documentElement.style.setProperty(d[1],v.alpha<1?'rgba('+rr+','+gg+','+bb+','+v.alpha+')':v.hex);
}
}catch(e){}})();` }} />
      </head>
      <body className="antialiased">
        <PaletteProvider />
        {children}
      </body>
    </html>
  );
}

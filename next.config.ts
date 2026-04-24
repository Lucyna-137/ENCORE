import type { NextConfig } from "next";

/**
 * Build targets:
 *
 *  - Web (Vercel hosted):   `npm run build`
 *      サーバー機能を含む通常ビルド。API routes も動く（将来復活時）。
 *
 *  - iOS / Android (Capacitor):   `CAPACITOR_BUILD=1 npm run build`
 *      静的書き出し (out/)。Capacitor が WebView のアセットとして同梱する。
 *      API routes は含まれないので、事前に _api-disabled/ に退避済みであること。
 */
const isCapacitorBuild = process.env.CAPACITOR_BUILD === "1";

const nextConfig: NextConfig = {
  ...(isCapacitorBuild
    ? {
        output: "export" as const,
        // 静的書き出しでは next/image の最適化サーバーが使えないため、元画像を素通しする
        images: { unoptimized: true },
        // Capacitor の WKWebView (capacitor://localhost) は `/grape/calendar/` →
        // `grape/calendar/index.html` を期待する。trailingSlash なしだと Next.js が
        // `grape/calendar.html` を出力して 404 になる。
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
